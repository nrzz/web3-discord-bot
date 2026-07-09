# Quick Start Guide

Get your Web3 Discord Bot up and running in about 5 minutes.

## Prerequisites

- Node.js 18.0.0 or higher
- A Discord bot token ([Discord Developer Portal](https://discord.com/developers/applications))
- An Ethereum RPC URL (Infura, Alchemy, or another provider)

## 5-Minute Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example file and fill in your own credentials. **Never commit `config.env` to version control.**

```bash
cp config.env.example config.env
```

Edit `config.env` with your values:

```bash
# Windows (PowerShell)
notepad config.env

# macOS / Linux
nano config.env
```

Required variables:

| Variable | Where to get it |
|----------|-----------------|
| `DISCORD_TOKEN` | Discord Developer Portal → your app → Bot → Reset Token |
| `DISCORD_CLIENT_ID` | Discord Developer Portal → your app → General Information → Application ID |
| `DISCORD_GUILD_ID` | Discord → enable Developer Mode → right-click your server → Copy Server ID |
| `ETHEREUM_RPC_URL` | Infura, Alchemy, or another Ethereum RPC provider |

### 3. Deploy Commands

```bash
node deploy-commands.js
```

### 4. Start the Bot

```bash
npm start
```

## Test the Bot

Once the bot is running, try these commands in your Discord server:

```
/balance address:0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
/help
/status
/networks
```

## Production Deployment

### Option 1: PM2 (Recommended)

```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 logs web3-discord-bot
pm2 status
```

### Option 2: Docker

Deploy slash commands **before** building or starting the container (the image does not run `deploy-commands.js`):

```bash
node deploy-commands.js
docker-compose up -d
docker-compose logs -f
```

### Option 3: Direct Node.js

```bash
node src/index.js
```

## Monitoring

- Health check: `http://localhost:3000/health`
- Application logs: `./logs/bot.log`
- PM2: `pm2 monit`

## Troubleshooting

**Bot not responding to commands**

- Run `node deploy-commands.js` again after adding the bot to a new server
- Confirm the bot has the `applications.commands` scope and required permissions
- Check `./logs/bot.log` for errors

**Network connection issues**

- Verify RPC URLs in `config.env`
- Run `/networks` to see which chains are configured
- Confirm API keys are valid if you use paid RPC tiers

**Rate limiting**

- Default limit is 5 commands per user per minute
- Wait for the cooldown shown in the bot reply
- Adjust `COMMAND_RATE_LIMIT_MAX` and `COMMAND_RATE_LIMIT_WINDOW_MS` in `config.env`

## Security Notes

- `config.env` is gitignored — keep it local only
- Use a dedicated bot account; do not reuse personal Discord credentials
- Rotate credentials immediately if they are ever exposed (see below)
- Monitor logs for unusual activity

## Credential Rotation

If a token or API key may have been exposed, rotate it immediately:

### Discord bot token

1. Open [Discord Developer Portal](https://discord.com/developers/applications) and select your application.
2. Go to **Bot** → **Reset Token** → confirm.
3. Copy the new token into `config.env` as `DISCORD_TOKEN`.
4. Restart the bot (`npm start`, `pm2 restart`, or `docker-compose restart`).
5. Old tokens stop working as soon as they are reset.

### Infura (or other RPC) project key

1. Sign in to [Infura](https://app.infura.io/) (or your RPC provider dashboard).
2. Open the project that owns the exposed key.
3. Regenerate or delete the compromised API key and create a new one.
4. Update `ETHEREUM_RPC_URL` in `config.env` with the new project ID.
5. Restart the bot.

### Optional block explorer / price API keys

1. Revoke or regenerate keys in Etherscan, Polygonscan, BscScan, or CoinGecko dashboards.
2. Update the matching variables in `config.env`.
3. Restart the bot.

### After rotation

- Confirm the bot comes online and `/status` reports connected networks.
- Re-run `node deploy-commands.js` only if you changed `DISCORD_CLIENT_ID` or guild scope.
- Audit git history: `git log --all --full-history -- config.env` should return no commits.

## Support

- Detailed docs: `README.md`
- Bugs: open a GitHub issue
- Questions: GitHub Discussions

## Next Steps

1. Add Polygon, BSC, and Arbitrum RPC URLs for multi-chain support
2. Add Etherscan and CoinGecko API keys for enhanced features
3. Customize commands for your community
4. Deploy with PM2 or Docker on a production host
