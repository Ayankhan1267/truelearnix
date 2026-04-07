module.exports = {
  apps: [
    {
      name: 'trulearnix-api',
      script: './apps/api/dist/index.js',
      cwd: '/var/www/trulearnix',
      env_file: './apps/api/.env',
      env: { NODE_ENV: 'production', PORT: 5000 },
      instances: 2,
      exec_mode: 'cluster',
      max_memory_restart: '500M',
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
    },
    {
      name: 'trulearnix-web',
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      cwd: '/var/www/trulearnix/apps/web',
      env: { NODE_ENV: 'production' },
      error_file: '/var/www/trulearnix/logs/web-error.log',
      out_file: '/var/www/trulearnix/logs/web-out.log',
    },
    {
      name: 'trulearnix-admin',
      script: 'node_modules/.bin/next',
      args: 'start -p 3003',
      cwd: '/var/www/trulearnix/apps/admin',
      env: { NODE_ENV: 'production', PORT: 3003 },
      error_file: '/var/www/trulearnix/logs/admin-error.log',
      out_file: '/var/www/trulearnix/logs/admin-out.log',
    }
  ]
}
