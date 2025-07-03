const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { web3Service } = require('../../services/web3Service');
const os = require('os');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Check bot and network status'),

  async execute (interaction) {
    await interaction.deferReply();

    try {
      const networkStatus = web3Service.getNetworkStatus();
      const uptime = process.uptime();
      const memoryUsage = process.memoryUsage();

      // Calculate uptime
      const days = Math.floor(uptime / 86400);
      const hours = Math.floor((uptime % 86400) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const uptimeString = `${days}d ${hours}h ${minutes}m`;

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('📊 Bot Status')
        .addFields(
          {
            name: '🤖 Bot Information',
            value: `• **Status:** Online ✅\n• **Uptime:** ${uptimeString}\n• **Memory:** ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB\n• **Platform:** ${os.platform()}`,
            inline: true
          },
          {
            name: '🌐 Network Status',
            value: Object.entries(networkStatus).map(([_network, status]) =>
              `• **${status.name}:** ${status.connected ? '🟢 Connected' : '🔴 Disconnected'}`
            ).join('\n'),
            inline: true
          },
          {
            name: '📈 System Info',
            value: `• **CPU:** ${os.cpus()[0].model}\n• **Node.js:** ${process.version}\n• **Discord.js:** ${require('discord.js').version}\n• **Guilds:** ${interaction.client.guilds.cache.size}`,
            inline: false
          }
        )
        .setFooter({ text: 'Last updated', iconURL: interaction.client.user.displayAvatarURL() })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('❌ Error')
        .setDescription(`Failed to get status: ${error.message}`)
        .setTimestamp();

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  }
};
