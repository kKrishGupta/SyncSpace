require('dotenv').config();

const http = require('http');
const {connectRedis, connectRedisPubSub} = require('./src/config/redis');
const app = require('./src/app');
const connectDB = require('./src/config/database');
const logger = require('./src/utils/logger');

const initializeWebSocketServer = require('./src/websocket/websocketServer');
const initializeRedisEventHandler = require('./src/websocket/redisEventHandler');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();
    await connectRedisPubSub();
    // await initializeRedisEventHandler();
    const server = http.createServer(app);

    // Initialize WebSocket server
    initializeWebSocketServer(server);

    // Start HTTP + WebSocket server
    server.listen(PORT, () => {
      logger.info(
        `Server is running on port http://localhost:${PORT}`
      );
    });

  } catch (error) {
    logger.error('Error starting the server', error);
    process.exit(1);
  }
};

startServer();