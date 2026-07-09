const balanceCommand = require('../commands/balance/balance');
const helpCommand = require('../commands/utility/help');
const networksCommand = require('../commands/utility/networks');
const statusCommand = require('../commands/utility/status');
const { globalRateLimiter, wrapCommandWithRateLimit } = require('../utils/rateLimiter');
const { web3Service } = require('../services/web3Service');

describe('Command execute()', () => {
  beforeEach(() => {
    globalRateLimiter.limits.clear();
    web3Service.providers.clear();
  });

  describe('help command', () => {
    test('replies with an embed', async () => {
      const interaction = global.testUtils.createMockInteraction();

      await helpCommand.execute(interaction);

      expect(interaction.reply).toHaveBeenCalledTimes(1);
      expect(interaction.reply).toHaveBeenCalledWith(
        expect.objectContaining({ embeds: expect.any(Array) })
      );
    });
  });

  describe('networks command', () => {
    test('replies with supported networks', async () => {
      const interaction = global.testUtils.createMockInteraction();

      await networksCommand.execute(interaction);

      expect(interaction.reply).toHaveBeenCalledTimes(1);
      expect(interaction.reply).toHaveBeenCalledWith(
        expect.objectContaining({ embeds: expect.any(Array) })
      );
    });
  });

  describe('status command', () => {
    test('defers and edits reply with status embed', async () => {
      const interaction = global.testUtils.createMockInteraction({
        client: {
          user: { displayAvatarURL: jest.fn().mockReturnValue('https://example.com/bot.png') },
          guilds: { cache: { size: 1 } }
        }
      });

      await statusCommand.execute(interaction);

      expect(interaction.deferReply).toHaveBeenCalledTimes(1);
      expect(interaction.editReply).toHaveBeenCalledWith(
        expect.objectContaining({ embeds: expect.any(Array) })
      );
    });
  });

  describe('balance command', () => {
    test('defers and edits reply for a valid address', async () => {
      web3Service.providers.set('ethereum', {
        provider: {
          getBalance: jest.fn().mockResolvedValue(1000000000000000000n),
          getBlockNumber: jest.fn().mockResolvedValue(12345678)
        },
        config: {
          name: 'Ethereum',
          symbol: 'ETH',
          explorer: 'https://etherscan.io'
        }
      });

      const interaction = global.testUtils.createMockInteraction({
        address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        network: 'ethereum'
      });

      await balanceCommand.execute(interaction);

      expect(interaction.deferReply).toHaveBeenCalledTimes(1);
      expect(interaction.editReply).toHaveBeenCalledWith(
        expect.objectContaining({ embeds: expect.any(Array) })
      );
    });

    test('reports errors for an invalid address', async () => {
      web3Service.providers.set('ethereum', {
        provider: {},
        config: {
          name: 'Ethereum',
          symbol: 'ETH',
          explorer: 'https://etherscan.io'
        }
      });

      const interaction = global.testUtils.createMockInteraction({
        address: 'not-an-address',
        network: 'ethereum'
      });

      await balanceCommand.execute(interaction);

      expect(interaction.editReply).toHaveBeenCalledWith(
        expect.objectContaining({
          embeds: expect.arrayContaining([
            expect.objectContaining({ data: expect.objectContaining({ title: '❌ Error' }) })
          ])
        })
      );
    });
  });

  describe('rate limit wrapper', () => {
    test('blocks execute after the configured limit', async () => {
      const wrapped = wrapCommandWithRateLimit(helpCommand);
      const userId = 'rate-limit-user';

      for (let i = 0; i < 5; i++) {
        const interaction = global.testUtils.createMockInteraction({ userId });
        await wrapped.execute(interaction);
        expect(interaction.reply).toHaveBeenCalledTimes(1);
      }

      const blockedInteraction = global.testUtils.createMockInteraction({ userId });
      await wrapped.execute(blockedInteraction);

      expect(blockedInteraction.reply).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.stringContaining('Rate limit exceeded'),
          ephemeral: true
        })
      );
    });
  });
});
