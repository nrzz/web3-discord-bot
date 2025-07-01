# 🚀 Quick Start Guide

Get your Web3 Discord Bot up and running in 5 minutes!

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- Discord Bot Token (from Discord Developer Portal)
- Ethereum RPC URL (Infura, Alchemy, etc.)

## ⚡ 5-Minute Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Your `config.env` file is already configured with the provided tokens. If you need to modify it:

```bash
# Edit config.env with your settings
nano config.env
```

### 3. Deploy Commands
```bash
node deploy-commands.js
```

### 4. Start the Bot
```bash
npm start
```

## 🎯 Test the Bot

Once the bot is running, test these commands in your Discord server:

### Check Balance
```
/balance address:0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
```

### Get Help
```
/help
```

### Check Status
```
/status
```

### List Networks
```
/networks
```

## 🔧 Production Deployment

### Option 1: PM2 (Recommended)
```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start ecosystem.config.js

# Monitor logs
pm2 logs web3-discord-bot

# Check status
pm2 status
```

### Option 2: Docker
```bash
# Build and run with Docker Compose
docker-compose up -d

# Check logs
docker-compose logs -f
```

### Option 3: Direct Node.js
```bash
# Start directly
node src/index.js
```

## 📊 Monitoring

### Health Check
Visit `http://localhost:3000/health` to check bot status

### Logs
- Application logs: `./logs/bot.log`
- Error logs: `./logs/error.log`

### PM2 Monitoring
```bash
pm2 monit
```

## 🛠️ Troubleshooting

### Common Issues

**Bot not responding to commands:**
- Check if commands were deployed: `node deploy-commands.js`
- Verify bot has proper permissions in Discord server
- Check logs for errors

**Network connection issues:**
- Verify RPC URLs in `config.env`
- Check network status: `/networks`
- Ensure API keys are valid (if using)

**Rate limiting:**
- Bot includes built-in rate limiting
- Wait 60 seconds between commands per user
- Check `/status` for rate limit info

### Debug Mode
```bash
# Set debug logging
export LOG_LEVEL=debug
npm start
```

## 🔒 Security Notes

- Never commit `config.env` to version control
- Use strong encryption keys in production
- Regularly rotate API keys
- Monitor logs for suspicious activity

## 📞 Support

- **Documentation**: Check `README.md` for detailed docs
- **Issues**: Create GitHub issues for bugs
- **Discussions**: Use GitHub Discussions for questions

## 🎉 Next Steps

1. **Add More Networks**: Configure Polygon, BSC, Arbitrum RPC URLs
2. **Get API Keys**: Add Etherscan, CoinGecko API keys for enhanced features
3. **Customize**: Modify commands and responses for your needs
4. **Scale**: Deploy to production server with PM2 or Docker

---

**Your Web3 Discord Bot is ready! 🚀** 