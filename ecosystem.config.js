module.exports = {
  apps: [
    {
      name: 'trulearnix-api',
      script: './apps/api/dist/index.js',
      node_args: '-r dotenv/config',
      cwd: '/var/www/trulearnix',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
        DOTENV_CONFIG_PATH: '/var/www/trulearnix/apps/api/.env',
      },
      instances: 1,
      exec_mode: 'fork',
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
    },
    {
      name: 'trulance',
      script: '/var/www/trulearnix/node_modules/.bin/next',
      args: 'start -p 3005',
      cwd: '/var/www/trulearnix/apps/trulance',
      env: { NODE_ENV: 'production' },
      error_file: '/var/www/trulearnix/logs/trulance-error.log',
      out_file: '/var/www/trulearnix/logs/trulance-out.log',
    }
  ]
}
