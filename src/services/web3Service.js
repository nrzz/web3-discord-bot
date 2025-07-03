const { ethers } = require('ethers');
const logger = require('../utils/logger');

class Web3Service {
  constructor () {
    this.providers = new Map();
    this.supportedNetworks = {
      ethereum: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
        rpcUrl: process.env.ETHEREUM_RPC_URL,
        explorer: 'https://etherscan.io',
        apiKey: process.env.ETHERSCAN_API_KEY
      },
      polygon: {
        name: 'Polygon',
        symbol: 'MATIC',
        decimals: 18,
        rpcUrl: process.env.POLYGON_RPC_URL,
        explorer: 'https://polygonscan.com',
        apiKey: process.env.POLYGONSCAN_API_KEY
      },
      bsc: {
        name: 'Binance Smart Chain',
        symbol: 'BNB',
        decimals: 18,
        rpcUrl: process.env.BSC_RPC_URL,
        explorer: 'https://bscscan.com',
        apiKey: process.env.BSCSCAN_API_KEY
      },
      arbitrum: {
        name: 'Arbitrum',
        symbol: 'ETH',
        decimals: 18,
        rpcUrl: process.env.ARBITRUM_RPC_URL,
        explorer: 'https://arbiscan.io',
        apiKey: process.env.ARBITRUMSCAN_API_KEY
      }
    };
  }

  async initializeWeb3Providers () {
    logger.info('Initializing Web3 providers...');

    for (const [network, config] of Object.entries(this.supportedNetworks)) {
      if (config.rpcUrl) {
        try {
          const provider = new ethers.JsonRpcProvider(config.rpcUrl);

          // Test the connection
          const blockNumber = await provider.getBlockNumber();
          logger.info(`Connected to ${config.name} (${network}) - Block: ${blockNumber}`);

          this.providers.set(network, {
            provider,
            config
          });
        } catch (error) {
          logger.error(`Failed to connect to ${config.name} (${network}):`, error.message);
        }
      } else {
        logger.warn(`No RPC URL provided for ${config.name} (${network})`);
      }
    }

    logger.info(`Initialized ${this.providers.size} Web3 providers`);
  }

  // Get balance for a specific address on a specific network
  async getBalance (address, network = 'ethereum') {
    try {
      const providerInfo = this.providers.get(network);
      if (!providerInfo) {
        throw new Error(`Network ${network} not supported or not configured`);
      }

      const { provider, config } = providerInfo;

      // Validate address
      if (!ethers.isAddress(address)) {
        throw new Error('Invalid address format');
      }

      // Get balance
      const balance = await provider.getBalance(address);
      const balanceInEth = ethers.formatEther(balance);

      // Get token balances (if API key is available)
      let tokenBalances = [];
      if (config.apiKey) {
        tokenBalances = await this.getTokenBalances(address, network);
      }

      return {
        network: config.name,
        symbol: config.symbol,
        address,
        balance: balanceInEth,
        balanceWei: balance.toString(),
        tokenBalances,
        explorerUrl: `${config.explorer}/address/${address}`,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error(`Error getting balance for ${address} on ${network}:`, error.message);
      throw error;
    }
  }

  // Get balances across all supported networks
  async getBalances (address) {
    const results = [];
    const errors = [];

    for (const [network] of this.providers) {
      try {
        const balance = await this.getBalance(address, network);
        results.push(balance);
      } catch (error) {
        errors.push({
          network,
          error: error.message
        });
      }
    }

    return {
      address,
      balances: results,
      errors,
      timestamp: new Date().toISOString()
    };
  }

  // Get token balances using blockchain explorer APIs
  async getTokenBalances (address, network) {
    try {
      const providerInfo = this.providers.get(network);
      if (!providerInfo || !providerInfo.config.apiKey) {
        return [];
      }

      // const { config } = providerInfo;
      const { ethers } = require('ethers');

      // This is a simplified version - in production, you'd want to cache results
      // and handle rate limiting properly
      const tokens = await this.getTopTokens(network);
      const tokenBalances = [];

      for (const token of tokens.slice(0, 10)) { // Limit to top 10 tokens
        try {
          const tokenContract = new ethers.Contract(
            token.address,
            ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)'],
            providerInfo.provider
          );

          const balance = await tokenContract.balanceOf(address);
          const decimals = await tokenContract.decimals();

          if (balance > 0) {
            const formattedBalance = ethers.formatUnits(balance, decimals);
            tokenBalances.push({
              symbol: token.symbol,
              name: token.name,
              address: token.address,
              balance: formattedBalance,
              decimals
            });
          }
        } catch (error) {
          // Skip tokens that fail to load
          continue;
        }
      }

      return tokenBalances;
    } catch (error) {
      logger.error(`Error getting token balances for ${address} on ${network}:`, error.message);
      return [];
    }
  }

  // Get top tokens for a network (simplified - in production, use a token list API)
  async getTopTokens (network) {
    const tokenLists = {
      ethereum: [
        { symbol: 'USDT', name: 'Tether USD', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' },
        { symbol: 'USDC', name: 'USD Coin', address: '0xA0b86a33E6441b8C4C8C8C8C8C8C8C8C8C8C8C8C' },
        { symbol: 'DAI', name: 'Dai Stablecoin', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F' },
        { symbol: 'WETH', name: 'Wrapped Ether', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' }
      ],
      polygon: [
        { symbol: 'USDT', name: 'Tether USD', address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F' },
        { symbol: 'USDC', name: 'USD Coin', address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174' },
        { symbol: 'DAI', name: 'Dai Stablecoin', address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063' },
        { symbol: 'WMATIC', name: 'Wrapped MATIC', address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270' }
      ],
      bsc: [
        { symbol: 'USDT', name: 'Tether USD', address: '0x55d398326f99059fF775485246999027B3197955' },
        { symbol: 'USDC', name: 'USD Coin', address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d' },
        { symbol: 'BUSD', name: 'Binance USD', address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56' },
        { symbol: 'WBNB', name: 'Wrapped BNB', address: '0xbb4CdB9CBd36B01bD1cBaEF60aF814a3f6F8E2A9' }
      ]
    };

    return tokenLists[network] || [];
  }

  // Get network status
  getNetworkStatus () {
    const status = {};

    for (const [network, providerInfo] of this.providers) {
      status[network] = {
        name: providerInfo.config.name,
        connected: true,
        rpcUrl: providerInfo.config.rpcUrl ? 'Configured' : 'Not configured'
      };
    }

    return status;
  }

  // Get supported networks
  getSupportedNetworks () {
    return Object.keys(this.supportedNetworks).map(network => ({
      id: network,
      name: this.supportedNetworks[network].name,
      symbol: this.supportedNetworks[network].symbol,
      configured: !!this.providers.get(network)
    }));
  }

  static isValidAddress (address) {
    if (!address || typeof address !== 'string') return false;
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }
}

// Create singleton instance
const web3Service = new Web3Service();

// Initialize providers
async function initializeWeb3Providers () {
  await web3Service.initializeWeb3Providers();
}

module.exports = {
  web3Service,
  initializeWeb3Providers,
  isValidAddress: Web3Service.isValidAddress
};
