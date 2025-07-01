const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show help information about the Web3 Discord Bot'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor('#0099FF')
      .setTitle('🤖 Web3 Discord Bot Help')
      .setDescription('A powerful Discord bot for checking Web3 wallet balances across multiple blockchains.')
      .addFields(
        {
          name: '📋 Available Commands',
          value: '• `/balance` - Check wallet balances across multiple networks\n• `/help` - Show this help message\n• `/status` - Check bot and network status\n• `/networks` - List supported networks',
          inline: false
        },
        {
          name: '🔗 Supported Networks',
          value: '• **Ethereum** (ETH)\n• **Polygon** (MATIC)\n• **Binance Smart Chain** (BNB)\n• **Arbitrum** (ETH)',
          inline: true
        },
        {
          name: '💡 Usage Examples',
          value: '• `/balance address:0x1234...` - Check all networks\n• `/balance address:0x1234... network:ethereum` - Check specific network',
          inline: true
        },
        {
          name: '⚡ Features',
          value: '• Multi-network balance checking\n• Token balance support\n• Rate limiting protection\n• Real-time blockchain data\n• Explorer links',
          inline: false
        },
        {
          name: '🔒 Privacy & Security',
          value: '• Address validation\n• Rate limiting per user\n• Secure API connections\n• No data storage',
          inline: false
        }
      )
      .setFooter({ text: 'Web3 Discord Bot v1.0.0', iconURL: interaction.client.user.displayAvatarURL() })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}; 