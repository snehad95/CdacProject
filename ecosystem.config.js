module.exports = {
  apps: [
    {
      name: 'cdac-examweb-backend',
      script: './server.js',
      cwd: './backend',
      instances: 'max', // Uses all available CPU cores for Load Balancing
      exec_mode: 'cluster', // Enables Node.js cluster mode
      watch: false,
      max_memory_restart: '1G', // Auto-recovery if memory exceeds 1GB
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      time: true
    }
  ]
};
