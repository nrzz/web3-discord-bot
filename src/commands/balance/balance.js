const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { web3Service } = require('../../services/web3Service');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check Web3 wallet balances across multiple blockchains')
    .addStringOption(option =>
      option.setName('address')
        .setDescription('The wallet address to check')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('network')
        .setDescription('Specific network to check (optional)')
        .setRequired(false)
        .addChoices(
          { name: 'All Networks', value: 'all' },
          { name: 'Ethereum', value: 'ethereum' },
          { name: 'Polygon', value: 'polygon' },
          { name: 'Binance Smart Chain', value: 'bsc' },
          { name: 'Arbitrum', value: 'arbitrum' }
        )),

  async execute (interaction) {
    await interaction.deferReply();

    try {
      const address = interaction.options.getString('address');
      const network = interaction.options.getString('network') || 'all';

      logger.info(`Balance check requested for ${address} on ${network} by ${interaction.user.tag}`);

      let result;
      if (network === 'all') {
        result = await web3Service.getBalances(address);
      } else {
        const balance = await web3Service.getBalance(address, network);
        result = {
          address,
          balances: [balance],
          errors: [],
          timestamp: new Date().toISOString()
        };
      }

      const embed = createBalanceEmbed(result, interaction.user);
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      logger.error('Error in balance command:', error);

      const errorEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('❌ Error')
        .setDescription(`Failed to fetch balance: ${error.message}`)
        .setTimestamp();

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  }
};

function createBalanceEmbed (result, user) {
  const embed = new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle('💰 Web3 Balance Check')
    .setDescription(`**Address:** \`${result.address}\``)
    .setFooter({ text: `Requested by ${user.tag}`, iconURL: user.displayAvatarURL() })
    .setTimestamp();

  if (result.balances.length === 0) {
    embed.setDescription('❌ No balances found or all networks failed to respond.');
    return embed;
  }

  // Add balance fields
  result.balances.forEach(balance => {
    const value = parseFloat(balance.balance);
    let emoji = '💎';
    if (value > 1) emoji = '🤑';
    else if (value > 0.1) emoji = '💰';
    else if (value > 0.01) emoji = '💵';
    else if (value > 0) emoji = '🪙';

    const fieldValue = `${emoji} **${parseFloat(balance.balance).toFixed(6)} ${balance.symbol}**\n`;

    // Add token balances if available
    let tokenInfo = '';
    if (balance.tokenBalances && balance.tokenBalances.length > 0) {
      tokenInfo = '\n**Tokens:**\n';
      balance.tokenBalances.slice(0, 5).forEach(token => {
        tokenInfo += `• ${token.symbol}: ${parseFloat(token.balance).toFixed(4)}\n`;
      });
      if (balance.tokenBalances.length > 5) {
        tokenInfo += `• ... and ${balance.tokenBalances.length - 5} more\n`;
      }
    }

    embed.addFields({
      name: `${balance.network}`,
      value: fieldValue + tokenInfo + `[View on Explorer](${balance.explorerUrl})`,
      inline: true
    });
  });

  // Add error information if any
  if (result.errors && result.errors.length > 0) {
    const errorText = result.errors.map(error =>
      `• ${error.network}: ${error.error}`
    ).join('\n');

    embed.addFields({
      name: '⚠️ Errors',
      value: errorText,
      inline: false
    });
  }

  return embed;
}
