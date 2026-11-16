#!/usr/bin/env bash
# Pulls main and redeploys a site if it changed. Run by cron every 2 minutes, so
# a push to main goes live the way it did on Vercel:
#   deploy.sh fw     founders-wing-landing  -> build, then reload fw-site
#   deploy.sh tse    the-solo-entrepreneur  -> reload tse-site (no build step)
# Add --force to redeploy without a new commit.
set -euo pipefail
site="${1:?usage: deploy.sh fw|tse [--force]}"
force="${2:-}"
case "$site" in
  fw)  dir=/var/www/fw-site;  app=fw-site ;;
  tse) dir=/var/www/tse-site; app=tse-site ;;
  *) echo "unknown site $site"; exit 1 ;;
esac

exec 9>"/tmp/deploy-$site.lock"
flock -n 9 || exit 0   # a deploy is already running

cd "$dir"
git fetch -q origin main
if [ "$(git rev-parse HEAD)" = "$(git rev-parse origin/main)" ] && [ "$force" != "--force" ]; then exit 0; fi

log="/var/log/deploy-$site.log"
{
  echo "== $(date -u +%FT%TZ) deploying $(git rev-parse --short origin/main)"
  prev=$(git rev-parse HEAD)
  git reset -q --hard origin/main
  if [ "$site" = fw ]; then
    if [ ! -d node_modules ] || ! git diff --quiet "$prev" HEAD -- package.json package-lock.json; then npm ci --no-audit --no-fund; fi
    # Build next to the live one, so a failed build never takes the site down.
    NODE_OPTIONS=--max-old-space-size=2048 NEXT_DIST_DIR=.next-build npx next build || { echo "build failed, keeping the live version"; git reset -q --hard "$prev"; exit 1; }
    rm -rf .next-old && mv .next .next-old 2>/dev/null || true
    mv .next-build .next && rm -rf .next-old
  fi
  pm2 reload "$app" --update-env
  echo "== done"
} >>"$log" 2>&1
