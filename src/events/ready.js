const logger = require('../utils/logger');

module.exports = {
  name: 'ready',
  once: true,
  execute (client) {
    logger.info(`Ready! Logged in as ${client.user.tag}`);

    // Set bot status
    client.user.setActivity('Web3 Balances | /help', { type: 'WATCHING' });

    // Log guild information
    logger.info(`Bot is in ${client.guilds.cache.size} guilds:`);
    client.guilds.cache.forEach(guild => {
      logger.info(`- ${guild.name} (${guild.id})`);
    });
  }
};
