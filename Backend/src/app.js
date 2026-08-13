const express = require('express');
const app = express();
const cors = require('cors');
const helmet = require('helmet');
const pinoHttp = require('pino-http');
const logger = require('./utils/logger');

// security middleware 
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// pino http logger middleware
app.use(pinoHttp({ logger }));

// health check endpoint
app.get('/health',(req,res) =>{
  res.status(200).json({status: 'success', message: 'SyncSpace API is running'});
});

//404 handler 
app.use((req,res) =>{
  res.status(404).json({status: 'error', message: 'Route not found'});
});

// Global error handler
app.use((err, req, res, next) =>{
  logger.error(err);
  res.status(500).json({status: 'error', message: 'Internal Server Error'});
});

module.exports = app;