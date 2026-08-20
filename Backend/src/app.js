const express = require('express');
const app = express();
const cors = require('cors');
const helmet = require('helmet');
const pinoHttp = require('pino-http');
const logger = require('./utils/logger');
const requireAuth = require('./middleware/requireAuth');
const authRoutes = require('./routes/authRoutes');
const workspaceRoutes = require('./routes/workspaceRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const commentRoutes = require('./routes/commentRoutes');

// security middleware 
app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({extended: true}));

// pino http logger middleware
app.use(pinoHttp({ logger }));

// health check endpoint
app.get('/health',(req,res) =>{
  res.status(200).json({status: 'success', message: 'SyncSpace API is running'});
});

// routes
app.use('/api/v1/auth', authRoutes);

// Protected routes
app.use('/api/v1', requireAuth, workspaceRoutes);
app.use('/api/v1', requireAuth, projectRoutes);
app.use('/api/v1', requireAuth, taskRoutes);
app.use('/api/v1', requireAuth, commentRoutes);

//404 handler 
app.use((req,res) =>{
  res.status(404).json({status: 'error', message: 'Route not found'});
});

// Global error handler
app.use((err, req, res, next) =>{
  logger.error(err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    status: 'error', 
    message: message
  });
});

module.exports = app;