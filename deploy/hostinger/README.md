# Hostinger VPS deploy

Both sites run on the KVM 2 VPS (srv1006166.hstgr.cloud, 93.127.199.136) behind
the server's nginx, managed by pm2:

| Site | Code on server | Process | Port |
|---|---|---|---|
| founderswing.com | /var/www/fw-site (this repo) | fw-site | 127.0.0.1:3100 |
| thesoloentrepreneur.in | /var/www/tse-site | tse-site (tse-server.mjs) | 127.0.0.1:3200 |

Test addresses before the domains move: https://fw.srv1006166.hstgr.cloud and
https://tse.srv1006166.hstgr.cloud.

- **Secrets** live only on the server: `/var/www/fw-site/.env.production` and `/var/www/tse.env` (chmod 600).
- **Deploys:** cron runs `deploy.sh fw` and `deploy.sh tse` every 2 minutes; a push to main goes live. Logs in `/var/log/deploy-*.log`. `deploy.sh fw --force` rebuilds now.
- **nginx:** `nginx-sites.conf` + the two snippets; certbot adds the HTTPS listeners. After pointing a domain here: `certbot --nginx -d founderswing.com -d www.founderswing.com --redirect`.
- **Events refresh:** install the `events-cron.sh` lines (see the script) once founderswing.com points here, and set `CRON_SECRET`.
