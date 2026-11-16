#!/usr/bin/env bash
# Runs one step of the weekly events refresh on the VPS (Vercel ran these from
# vercel.json). Install in root's crontab only after founderswing.com points
# here, or the crawl would run twice:
#   0 18 * * 0  /var/www/fw-site/deploy/hostinger/events-cron.sh eventbrite
#   0 19 * * 0  .../events-cron.sh meetup
#   0 20 * * 0  .../events-cron.sh luma
#   0 21 * * 0  .../events-cron.sh allevents
#   0 22,23 * * 0  .../events-cron.sh enrich
#   0 0 * * 1   .../events-cron.sh enrich
#   0 1 * * 1   .../events-cron.sh verify
set -euo pipefail
step="${1:?usage: events-cron.sh <step>}"
secret=$(grep -E '^CRON_SECRET=' /var/www/fw-site/.env.production | cut -d= -f2-)
[ -n "$secret" ] || { echo "CRON_SECRET missing from .env.production"; exit 1; }
curl -sS --max-time 300 -H "Authorization: Bearer $secret" -H "Host: www.founderswing.com" \
  "http://127.0.0.1:3100/api/cron/events?step=$step" >>/var/log/events-cron.log 2>&1
echo >>/var/log/events-cron.log
