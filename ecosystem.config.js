module.exports = {
  apps: [
    {
      name: 'sorsa-check-bot',
      script: './src/bot.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,
      env_file: '.env',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
