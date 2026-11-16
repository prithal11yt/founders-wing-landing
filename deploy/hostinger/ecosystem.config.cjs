// pm2 processes for both sites. Secrets live in env files on the server only:
//   /var/www/fw-site/.env.production   (read by Next.js)
//   /var/www/tse.env                   (read by node --env-file)
module.exports = {
  apps: [
    {
      name: 'fw-site',
      cwd: '/var/www/fw-site',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -H 127.0.0.1 -p 3100',
      env: { NODE_ENV: 'production' },
      max_memory_restart: '1200M',
    },
    {
      name: 'tse-site',
      cwd: '/var/www/tse-site',
      script: '/var/www/fw-site/deploy/hostinger/tse-server.mjs',
      node_args: '--env-file=/var/www/tse.env --no-warnings',
      env: { NODE_ENV: 'production', SITE_DIR: '/var/www/tse-site', PORT: '3200' },
      max_memory_restart: '300M',
    },
  ],
}
