const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const logger = require('./utils/logger');
const { setupRateLimiting } = require('./utils/rateLimiter');

class HealthServer {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors());
    
    // Rate limiting
    this.app.use(setupRateLimiting());
    
    // Logging middleware
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path} - ${req.ip}`);
      next();
    });
  }

  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: require('../package.json').version
      });
    });

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        name: 'Web3 Discord Bot',
        version: require('../package.json').version,
        status: 'running',
        endpoints: {
          health: '/health',
          status: '/status'
        }
      });
    });

    // Status endpoint with more details
    this.app.get('/status', (req, res) => {
      const { web3Service } = require('./services/web3Service');
      
      res.json({
        bot: {
          status: 'running',
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          version: require('../package.json').version
        },
        networks: web3Service.getNetworkStatus(),
        environment: process.env.NODE_ENV || 'development'
      });
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`
      });
    });

    // Error handler
    this.app.use((error, req, res, next) => {
      logger.error('HTTP Server Error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : error.message
      });
    });
  }

  start() {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.port, () => {
        logger.info(`Health server started on port ${this.port}`);
        resolve();
      });

      this.server.on('error', (error) => {
        logger.error('Health server error:', error);
        reject(error);
      });
    });
  }

  stop() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          logger.info('Health server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

module.exports = HealthServer; 