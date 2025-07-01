const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { web3Service } = require('../../services/web3Service');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('networks')
    .setDescription('List supported networks and their status'),

  async execute(interaction) {
    try {
      const networks = web3Service.getSupportedNetworks();
      const networkStatus = web3Service.getNetworkStatus();

      const embed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle('🌐 Supported Networks')
        .setDescription('List of all supported blockchain networks and their current status.');

      // Group networks by status
      const configuredNetworks = networks.filter(network => network.configured);
      const unconfiguredNetworks = networks.filter(network => !network.configured);

      if (configuredNetworks.length > 0) {
        const configuredList = configuredNetworks.map(network => 
          `🟢 **${network.name}** (${network.symbol})`
        ).join('\n');
        
        embed.addFields({
          name: '✅ Configured Networks',
          value: configuredList,
          inline: true
        });
      }

      if (unconfiguredNetworks.length > 0) {
        const unconfiguredList = unconfiguredNetworks.map(network => 
          `🔴 **${network.name}** (${network.symbol})`
        ).join('\n');
        
        embed.addFields({
          name: '❌ Unconfigured Networks',
          value: unconfiguredList + '\n\n*Add RPC URLs to config.env to enable*',
          inline: true
        });
      }

      // Add network details
      const networkDetails = Object.entries(networkStatus).map(([network, status]) => {
        const statusEmoji = status.connected ? '🟢' : '🔴';
        return `${statusEmoji} **${status.name}**\n   RPC: ${status.rpcUrl}`;
      }).join('\n\n');

      if (networkDetails) {
        embed.addFields({
          name: '📋 Network Details',
          value: networkDetails,
          inline: false
        });
      }

      embed.setFooter({ text: `${networks.length} networks supported`, iconURL: interaction.client.user.displayAvatarURL() })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('❌ Error')
        .setDescription(`Failed to get networks: ${error.message}`)
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
    }
  }
}; 