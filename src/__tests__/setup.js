// Jest setup file for global test configuration

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.ETHEREUM_RPC_URL = 'https://mainnet.infura.io/v3/test';
process.env.POLYGON_RPC_URL = 'https://polygon-rpc.com';
process.env.BSC_RPC_URL = 'https://bsc-dataseed.binance.org';
process.env.ARBITRUM_RPC_URL = 'https://arb1.arbitrum.io/rpc';
process.env.DISCORD_TOKEN = 'test-token';
process.env.DISCORD_CLIENT_ID = 'test-client-id';
process.env.DISCORD_GUILD_ID = 'test-guild-id';
process.env.PORT = '3000';
process.env.RATE_LIMIT_WINDOW_MS = '900000';
process.env.RATE_LIMIT_MAX_REQUESTS = '100';
process.env.LOG_LEVEL = 'error'; // Reduce log noise during tests
process.env.ENCRYPTION_KEY = 'test-encryption-key-32-chars-long';

// Global test timeout
jest.setTimeout(10000);

// Suppress console output during tests (optional)
if (process.env.SUPPRESS_LOGS === 'true') {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  };
}

// Mock Discord.js to avoid actual Discord API calls
jest.mock('discord.js', () => ({
  Client: jest.fn().mockImplementation(() => ({
    login: jest.fn(),
    on: jest.fn(),
    user: { tag: 'TestBot#1234' },
    guilds: { cache: { size: 1 } }
  })),
  GatewayIntentBits: {
    Guilds: 1,
    GuildMessages: 2,
    MessageContent: 4
  },
  SlashCommandBuilder: jest.requireActual('discord.js').SlashCommandBuilder,
  EmbedBuilder: jest.requireActual('discord.js').EmbedBuilder,
  Collection: jest.requireActual('discord.js').Collection
}));

// Mock ethers.js to avoid actual blockchain calls
jest.mock('ethers', () => ({
  ethers: {
    JsonRpcProvider: jest.fn().mockImplementation(() => ({
      getBalance: jest.fn().mockResolvedValue('1000000000000000000'),
      getBlockNumber: jest.fn().mockResolvedValue(12345678),
      formatEther: jest.fn().mockReturnValue('1.0'),
      formatUnits: jest.fn().mockReturnValue('100.0'),
      isAddress: jest.fn().mockImplementation((address) => {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
      }),
      Contract: jest.fn().mockImplementation(() => ({
        balanceOf: jest.fn().mockResolvedValue('1000000000000000000'),
        decimals: jest.fn().mockResolvedValue(18)
      }))
    })),
    formatEther: jest.fn().mockReturnValue('1.0'),
    formatUnits: jest.fn().mockReturnValue('100.0'),
    isAddress: jest.fn().mockImplementation((address) => {
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    }),
    Contract: jest.fn().mockImplementation(() => ({
      balanceOf: jest.fn().mockResolvedValue('1000000000000000000'),
      decimals: jest.fn().mockResolvedValue(18)
    }))
  }
}));

// Mock winston logger to avoid file system operations
jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

// Global test utilities
global.testUtils = {
  // Helper to create mock Discord interaction
  createMockInteraction: (options = {}) => ({
    deferReply: jest.fn().mockResolvedValue(),
    editReply: jest.fn().mockResolvedValue(),
    reply: jest.fn().mockResolvedValue(),
    options: {
      getString: jest.fn().mockImplementation((name) => {
        return options[name] || null;
      })
    },
    user: {
      tag: 'TestUser#1234',
      displayAvatarURL: jest.fn().mockReturnValue('https://example.com/avatar.png')
    },
    client: {
      user: {
        displayAvatarURL: jest.fn().mockReturnValue('https://example.com/bot-avatar.png')
      }
    },
    ...options
  }),

  // Helper to create mock Discord client
  createMockClient: () => ({
    login: jest.fn(),
    on: jest.fn(),
    user: { tag: 'TestBot#1234' },
    guilds: { cache: { size: 1 } }
  }),

  // Helper to wait for async operations
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms))
}; 