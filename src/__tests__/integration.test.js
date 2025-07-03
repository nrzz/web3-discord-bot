const { web3Service } = require('../services/web3Service');
const { globalRateLimiter } = require('../utils/rateLimiter');

describe('Integration Tests', () => {
  beforeEach(() => {
    // Reset state before each test
    web3Service.providers.clear();
    globalRateLimiter.limits.clear();
  });

  describe('Application Flow', () => {
    test('should handle complete balance check flow', async () => {
      // Mock a provider for testing
      const mockProvider = {
        getBalance: jest.fn().mockResolvedValue('1000000000000000000'), // 1 ETH in wei
        getBlockNumber: jest.fn().mockResolvedValue(12345678)
      };

      web3Service.providers.set('ethereum', {
        provider: mockProvider,
        config: {
          name: 'Ethereum',
          symbol: 'ETH',
          explorer: 'https://etherscan.io'
        }
      });

      const address = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
      
      // Test rate limiting
      const isLimited = globalRateLimiter.isRateLimited('test-user', 'balance');
      expect(isLimited).toBe(false);

      // Test balance retrieval
      const balance = await web3Service.getBalance(address, 'ethereum');
      
      expect(balance).toHaveProperty('network', 'Ethereum');
      expect(balance).toHaveProperty('symbol', 'ETH');
      expect(balance).toHaveProperty('address', address);
      expect(balance).toHaveProperty('balance');
      expect(balance).toHaveProperty('explorerUrl');
      expect(balance).toHaveProperty('timestamp');
      
      expect(mockProvider.getBalance).toHaveBeenCalledWith(address);
    });

    test('should handle multiple network balance check', async () => {
      // Mock providers for multiple networks
      const mockEthereumProvider = {
        getBalance: jest.fn().mockResolvedValue('1000000000000000000'),
        getBlockNumber: jest.fn().mockResolvedValue(12345678)
      };

      const mockPolygonProvider = {
        getBalance: jest.fn().mockResolvedValue('5000000000000000000'),
        getBlockNumber: jest.fn().mockResolvedValue(98765432)
      };

      web3Service.providers.set('ethereum', {
        provider: mockEthereumProvider,
        config: { name: 'Ethereum', symbol: 'ETH', explorer: 'https://etherscan.io' }
      });

      web3Service.providers.set('polygon', {
        provider: mockPolygonProvider,
        config: { name: 'Polygon', symbol: 'MATIC', explorer: 'https://polygonscan.com' }
      });

      const address = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
      
      const balances = await web3Service.getBalances(address);
      
      expect(balances).toHaveProperty('address', address);
      expect(balances).toHaveProperty('balances');
      expect(balances).toHaveProperty('errors');
      expect(balances).toHaveProperty('timestamp');
      
      expect(balances.balances).toHaveLength(2);
      expect(balances.errors).toHaveLength(0);
      
      // Check that both providers were called
      expect(mockEthereumProvider.getBalance).toHaveBeenCalledWith(address);
      expect(mockPolygonProvider.getBalance).toHaveBeenCalledWith(address);
    });

    test('should handle network errors gracefully', async () => {
      // Mock a provider that throws an error
      const mockProvider = {
        getBalance: jest.fn().mockRejectedValue(new Error('Network error')),
        getBlockNumber: jest.fn().mockResolvedValue(12345678)
      };

      web3Service.providers.set('ethereum', {
        provider: mockProvider,
        config: { name: 'Ethereum', symbol: 'ETH', explorer: 'https://etherscan.io' }
      });

      const address = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
      
      const balances = await web3Service.getBalances(address);
      
      expect(balances.balances).toHaveLength(0);
      expect(balances.errors).toHaveLength(1);
      expect(balances.errors[0]).toHaveProperty('network', 'ethereum');
      expect(balances.errors[0]).toHaveProperty('error', 'Network error');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid address gracefully', async () => {
      const invalidAddress = 'invalid-address';
      // Mock a provider for ethereum
      web3Service.providers.set('ethereum', {
        provider: {},
        config: { name: 'Ethereum', symbol: 'ETH' }
      });
      await expect(
        web3Service.getBalance(invalidAddress, 'ethereum')
      ).rejects.toThrow('Invalid address format');
    });

    test('should handle unsupported network gracefully', async () => {
      const address = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
      
      await expect(
        web3Service.getBalance(address, 'unsupported-network')
      ).rejects.toThrow('Network unsupported-network not supported or not configured');
    });
  });

  describe('Rate Limiting Integration', () => {
    test('should integrate rate limiting with balance checks', async () => {
      const userId = 'test-user-123';
      const commandName = 'balance';
      
      // Simulate multiple rapid requests
      for (let i = 0; i < 5; i++) {
        const isLimited = globalRateLimiter.isRateLimited(userId, commandName, 5);
        expect(isLimited).toBe(false);
      }
      
      // 6th request should be rate limited
      const isLimited = globalRateLimiter.isRateLimited(userId, commandName, 5);
      expect(isLimited).toBe(true);
      
      // Check remaining requests
      const remaining = globalRateLimiter.getRemainingRequests(userId, commandName);
      expect(remaining).toBe(0);
    });
  });
}); 