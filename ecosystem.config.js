module.exports = {
  apps: [{
    name: 'web3-discord-bot',
    script: 'src/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_file: './config.env',
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    time: true,
    // Graceful shutdown
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,
    // Health check
    health_check_grace_period: 3000,
    // Restart policy
    max_restarts: 10,
    min_uptime: '10s',
    // Monitoring
    pmx: true,
    // Cluster mode (if needed)
    // instances: 'max',
    // exec_mode: 'cluster'
  }]
}; 