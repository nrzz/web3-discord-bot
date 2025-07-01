# Web3 Discord Bot

A production-ready Discord bot for checking Web3 wallet balances across multiple blockchains. Built with Node.js, Discord.js, and Ethers.js.

## 🌟 Features

### v1.0.0 (Current)
- **Multi-Network Balance Checking**: Support for Ethereum, Polygon, BSC, and Arbitrum
- **Real-time Blockchain Data**: Direct RPC connections for accurate balance information
- **Token Balance Support**: Check ERC-20 token balances (when API keys are configured)
- **Rate Limiting**: Built-in protection against abuse
- **Comprehensive Logging**: Winston-based logging with file rotation
- **Health Monitoring**: Automated health checks for bot and network connectivity
- **Error Handling**: Robust error handling and graceful degradation
- **Security**: Address validation and secure API connections

### Planned Features (v2.0.0+)
- **Price Integration**: Real-time USD values using CoinGecko API
- **Portfolio Tracking**: Save and track multiple addresses
- **Transaction History**: View recent transactions
- **NFT Support**: Check NFT holdings
- **DeFi Integration**: Yield farming and liquidity pool information
- **Alert System**: Price and balance change notifications
- **Analytics Dashboard**: Web interface for detailed analytics
- **Multi-language Support**: Internationalization support

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0.0 or higher
- Discord Bot Token
- Ethereum RPC URL (Infura, Alchemy, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd web3-discord-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp config.env.example config.env
   # Edit config.env with your credentials
   ```

4. **Deploy slash commands**
   ```bash
   node deploy-commands.js
   ```

5. **Start the bot**
   ```bash
   npm start
   ```

## ⚙️ Configuration

### Required Environment Variables

```env
# Discord Configuration
DISCORD_TOKEN=your_discord_bot_token
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_GUILD_ID=your_discord_guild_id

# Ethereum RPC (Required)
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your_project_id

# Optional RPC URLs
POLYGON_RPC_URL=https://polygon-rpc.com
BSC_RPC_URL=https://bsc-dataseed.binance.org
ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc

# Optional API Keys (for enhanced features)
ETHERSCAN_API_KEY=your_etherscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key
BSCSCAN_API_KEY=your_bscscan_api_key
COINGECKO_API_KEY=your_coingecko_api_key

# Application Settings
PORT=3000
NODE_ENV=production
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
LOG_FILE_PATH=./logs/bot.log
ENCRYPTION_KEY=your_32_character_encryption_key_here
```

## 📋 Commands

### Available Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `/balance` | Check wallet balances across networks | `/balance address:0x1234... [network:ethereum]` |
| `/help` | Show help information | `/help` |
| `/status` | Check bot and network status | `/status` |
| `/networks` | List supported networks | `/networks` |

### Command Examples

```bash
# Check balance on all networks
/balance address:0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6

# Check balance on specific network
/balance address:0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6 network:ethereum

# Get bot status
/status

# List supported networks
/networks
```

## 🏗️ Architecture

### Project Structure
```
web3-discord-bot/
├── src/
│   ├── commands/           # Discord slash commands
│   │   ├── balance/        # Balance checking commands
│   │   └── utility/        # Utility commands (help, status, etc.)
│   ├── events/             # Discord event handlers
│   ├── handlers/           # Command and event loaders
│   ├── services/           # Business logic services
│   │   ├── web3Service.js  # Web3 blockchain interactions
│   │   └── healthCheck.js  # Health monitoring
│   └── utils/              # Utility functions
│       ├── logger.js       # Logging configuration
│       └── rateLimiter.js  # Rate limiting
├── logs/                   # Log files
├── config.env              # Environment configuration
├── package.json            # Dependencies and scripts
├── deploy-commands.js      # Command deployment script
└── README.md              # Documentation
```

### Key Components

1. **Web3Service**: Handles all blockchain interactions
2. **Rate Limiter**: Prevents command abuse
3. **Logger**: Comprehensive logging system
4. **Health Check**: Monitors bot and network health
5. **Command Handler**: Manages Discord slash commands

## 🔧 Development

### Scripts

```bash
# Start the bot
npm start

# Development mode with auto-restart
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

### Adding New Commands

1. Create a new file in `src/commands/[category]/`
2. Export an object with `data` and `execute` properties
3. Use `SlashCommandBuilder` for command definition
4. Run `node deploy-commands.js` to deploy

### Adding New Networks

1. Add network configuration to `web3Service.js`
2. Update the `supportedNetworks` object
3. Add RPC URL to environment variables
4. Test connectivity

## 📊 Monitoring

### Logs
- Application logs: `./logs/bot.log`
- Error logs: `./logs/error.log`
- Log rotation: Daily with 14-day retention

### Health Checks
- Bot status: Every 5 minutes
- Network connectivity: Every 10 minutes
- Memory usage monitoring
- Uptime tracking

## 🔒 Security

### Rate Limiting
- Per-user rate limiting
- Configurable limits and windows
- Automatic cleanup of expired entries

### Input Validation
- Address format validation
- Command parameter validation
- Error handling and sanitization

### Privacy
- No persistent data storage
- Secure API connections
- Environment variable protection

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**
   ```bash
   NODE_ENV=production
   ```

2. **Process Management**
   ```bash
   # Using PM2
   npm install -g pm2
   pm2 start src/index.js --name "web3-discord-bot"
   pm2 startup
   pm2 save
   ```

3. **Reverse Proxy (Optional)**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Issues**: Create an issue on GitHub
- **Discussions**: Use GitHub Discussions
- **Documentation**: Check this README and inline code comments

## 🔮 Roadmap

### v2.0.0 (Next Major Release)
- [ ] Price integration with CoinGecko
- [ ] Portfolio tracking
- [ ] Transaction history
- [ ] NFT support
- [ ] DeFi integration

### v2.1.0
- [ ] Alert system
- [ ] Web dashboard
- [ ] Multi-language support
- [ ] Advanced analytics

### v3.0.0
- [ ] Cross-chain bridges
- [ ] Smart contract interactions
- [ ] Advanced DeFi features
- [ ] Mobile app companion

---

**Built with ❤️ for the Web3 community** 