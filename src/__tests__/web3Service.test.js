const { web3Service, isValidAddress } = require('../services/web3Service');

// Mock environment variables
process.env.ETHEREUM_RPC_URL = 'https://mainnet.infura.io/v3/test';
process.env.POLYGON_RPC_URL = 'https://polygon-rpc.com';

describe('Web3Service', () => {
  beforeEach(() => {
    // Reset the service before each test
    web3Service.providers.clear();
  });

  describe('getSupportedNetworks', () => {
    test('should return array of supported networks', () => {
      const networks = web3Service.getSupportedNetworks();
      expect(Array.isArray(networks)).toBe(true);
      expect(networks.length).toBeGreaterThan(0);
      
      // Check network structure
      networks.forEach(network => {
        expect(network).toHaveProperty('id');
        expect(network).toHaveProperty('name');
        expect(network).toHaveProperty('symbol');
        expect(network).toHaveProperty('configured');
      });
    });
  });

  describe('getNetworkStatus', () => {
    test('should return network status object', () => {
      const status = web3Service.getNetworkStatus();
      expect(typeof status).toBe('object');
      
      // Check status structure for each network
      Object.values(status).forEach(networkStatus => {
        expect(networkStatus).toHaveProperty('name');
        expect(networkStatus).toHaveProperty('connected');
        expect(networkStatus).toHaveProperty('rpcUrl');
      });
    });
  });

  describe('address validation', () => {
    test('should validate correct Ethereum address', () => {
      const validAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
      expect(isValidAddress(validAddress)).toBe(true);
    });

    test('should reject invalid address', () => {
      const invalidAddress = 'invalid-address';
      expect(isValidAddress(invalidAddress)).toBe(false);
    });

    test('should reject empty address', () => {
      expect(isValidAddress('')).toBe(false);
      expect(isValidAddress(null)).toBe(false);
      expect(isValidAddress(undefined)).toBe(false);
    });
  });

  describe('error handling', () => {
    test('should handle network not configured error', async () => {
      await expect(
        web3Service.getBalance('0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', 'nonexistent')
      ).rejects.toThrow('Network nonexistent not supported or not configured');
    });

    test('should handle invalid address error', async () => {
      // Mock a provider to test address validation
      web3Service.providers.set('ethereum', {
        provider: {},
        config: { name: 'Ethereum', symbol: 'ETH' }
      });

      await expect(
        web3Service.getBalance('invalid-address', 'ethereum')
      ).rejects.toThrow('Invalid address format');
    });
  });
}); 