#!/usr/bin/env bash
# Pulls the latest code, rebuilds the site and restarts the API.
# Run on the server:  /var/www/optimas/deploy/update.sh
set -euo pipefail
cd "$(dirname "$0")/.."

git pull --ff-only
npm install --no-audit --no-fund
npm run build
(cd backend && npm install --omit=dev --no-audit --no-fund)
pm2 restart optimas-api --update-env
sleep 3
curl -fsS http://127.0.0.1:10000/health && echo
