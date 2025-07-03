require('dotenv').config({ path: './config.env' });
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const logger = require('./utils/logger');
const { loadCommands } = require('./handlers/commandHandler');
const { loadEvents } = require('./handlers/eventHandler');
const { initializeWeb3Providers } = require('./services/web3Service');
const { startHealthCheck } = require('./services/healthCheck');
const { setupRateLimiting } = require('./utils/rateLimiter');
const HealthServer = require('./server');

class Web3DiscordBot {
  constructor () {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
      ]
    });

    this.client.commands = new Collection();
    this.client.cooldowns = new Collection();

    // Initialize rate limiting
    this.rateLimiter = setupRateLimiting();

    // Initialize health server
    this.healthServer = new HealthServer();
  }

  async initialize () {
    try {
      logger.info('Initializing Web3 Discord Bot...');

      // Initialize Web3 providers
      await initializeWeb3Providers();
      logger.info('Web3 providers initialized successfully');

      // Load commands and events
      await loadCommands(this.client);
      await loadEvents(this.client);
      logger.info('Commands and events loaded successfully');

      // Start health check service
      startHealthCheck(this.client);
      logger.info('Health check service started');

      // Start health server
      await this.healthServer.start();
      logger.info('Health server started successfully');

      // Login to Discord
      await this.client.login(process.env.DISCORD_TOKEN);
      logger.info('Bot logged in successfully');
    } catch (error) {
      logger.error('Failed to initialize bot:', error);
      process.exit(1);
    }
  }

  async handleError (error) {
    logger.error('Unhandled error:', error);

    // Graceful shutdown
    if (this.healthServer) {
      await this.healthServer.stop();
    }

    if (this.client) {
      await this.client.destroy();
    }

    process.exit(1);
  }
}

// Create and initialize bot
const bot = new Web3DiscordBot();

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  bot.handleError(error);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  bot.handleError(reason);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  if (bot.healthServer) {
    await bot.healthServer.stop();
  }
  if (bot.client) {
    await bot.client.destroy();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  if (bot.healthServer) {
    await bot.healthServer.stop();
  }
  if (bot.client) {
    await bot.client.destroy();
  }
  process.exit(0);
});

// Start the bot
bot.initialize().catch((error) => {
  logger.error('Failed to start bot:', error);
  process.exit(1);
});
