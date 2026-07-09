const logger = require('../utils/logger');

module.exports = {
  name: 'interactionCreate',
  async execute (interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      logger.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    const userId = interaction.user.id;
    const commandName = interaction.commandName;

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
