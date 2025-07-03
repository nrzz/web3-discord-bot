const logger = require('../utils/logger');
const { globalRateLimiter } = require('../utils/rateLimiter');

module.exports = {
  name: 'interactionCreate',
  async execute (interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      logger.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    // Rate limiting
    const userId = interaction.user.id;
    const commandName = interaction.commandName;

    if (globalRateLimiter.isRateLimited(userId, commandName)) {
      const resetTime = globalRateLimiter.getResetTime(userId, commandName);
      const timeLeft = Math.ceil((resetTime - Date.now()) / 1000);

      await interaction.reply({
        content: `⏰ Rate limit exceeded! Please wait ${timeLeft} seconds before using this command again.`,
        ephemeral: true
      });
      return;
    }

    try {
      logger.info(`Executing command ${commandName} for user ${interaction.user.tag} (${userId})`);
      await command.execute(interaction);
    } catch (error) {
      logger.error(`Error executing command ${commandName}:`, error);

      const errorMessage = 'There was an error while executing this command!';

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: errorMessage, ephemeral: true });
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
    }
  }
};
