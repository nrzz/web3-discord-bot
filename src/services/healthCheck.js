const cron = require('node-cron');
const logger = require('../utils/logger');
const { web3Service } = require('./web3Service');

class HealthCheckService {
  constructor (client) {
    this.client = client;
    this.startTime = Date.now();
    this.healthStatus = {
      bot: true,
      networks: {},
      lastCheck: new Date().toISOString()
    };
  }

  start () {
    // Run health check every 5 minutes
    cron.schedule('*/5 * * * *', () => {
      this.performHealthCheck();
    });

    // Run network connectivity check every 10 minutes
    cron.schedule('*/10 * * * *', () => {
      this.checkNetworkConnectivity();
    });

    logger.info('Health check service started');
  }

  async performHealthCheck () {
    try {
      const currentTime = Date.now();
      const uptime = currentTime - this.startTime;

      // Check bot status
      this.healthStatus.bot = this.client.isReady();
      this.healthStatus.lastCheck = new Date().toISOString();
      this.healthStatus.uptime = uptime;

      // Log health status
      if (this.healthStatus.bot) {
        logger.debug('Health check passed - Bot is healthy');
      } else {
        logger.warn('Health check failed - Bot is not ready');
      }
    } catch (error) {
      logger.error('Health check error:', error);
      this.healthStatus.bot = false;
    }
  }

  async checkNetworkConnectivity () {
    try {
      const networkStatus = web3Service.getNetworkStatus();

      for (const [network, status] of Object.entries(networkStatus)) {
        this.healthStatus.networks[network] = status.connected;

        if (!status.connected) {
          logger.warn(`Network connectivity issue: ${network} is disconnected`);
        }
      }

      logger.debug('Network connectivity check completed');
    } catch (error) {
      logger.error('Network connectivity check error:', error);
    }
  }

  getHealthStatus () {
    return this.healthStatus;
  }

  isHealthy () {
    return this.healthStatus.bot && Object.values(this.healthStatus.networks).some(status => status);
  }
}

function startHealthCheck (client) {
  const healthCheck = new HealthCheckService(client);
  healthCheck.start();
  return healthCheck;
}

module.exports = {
  startHealthCheck,
  HealthCheckService
};
