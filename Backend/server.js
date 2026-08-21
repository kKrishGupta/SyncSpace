require('dotenv').config();

const http = require('http');
const mongoose = require('mongoose');
const { connectRedis, connectRedisPubSub, redisClient, redisPublisher, redisSubscriber } = require('./src/config/redis');
const app = require('./src/app');
const connectDB = require('./src/config/database');
const logger = require('./src/utils/logger');
const initializeWebSocketServer = require('./src/websocket/websocketServer');

const PORT = process.env.PORT || 5000;

let server;
let wss;

const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();
    await connectRedisPubSub();

    server = http.createServer(app);

    // Initialize WebSocket server
    wss = initializeWebSocketServer(server);

    // Start HTTP + WebSocket server
    server.listen(PORT, () => {
      logger.info(`SyncSpace server running on port http://localhost:${PORT}`);
    });

  } catch (error) {
    logger.error('Error starting the server', error);
    process.exit(1);
  }
};

const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Initiating graceful shutdown...`);

  if (server) {
    server.close(() => {
      logger.info('HTTP server closed.');
    });
  }

  if (wss) {
    wss.clients.forEach((client) => {
      client.close(1001, 'Server shutting down');
    });
    logger.info('WebSocket connections closed.');
  }

  try {
    if (redisPublisher?.isOpen) await redisPublisher.quit();
    if (redisSubscriber?.isOpen) await redisSubscriber.quit();
    if (redisClient?.isOpen) await redisClient.quit();
    logger.info('Redis connections closed.');

    await mongoose.connection.close();
    logger.info('MongoDB connection closed.');

    process.exit(0);
  } catch (err) {
    logger.error('Error during graceful shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();