module.exports = {
  apps: [
    {
      name: "meetstr",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      cwd: "/root/meetstr",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 4000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 4000,
      },
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      restart_delay: 4000,
    },
  ],
};
