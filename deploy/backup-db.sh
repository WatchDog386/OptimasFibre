#!/usr/bin/env bash
# Nightly PostgreSQL backup: keeps 14 days of compressed dumps in ~/backups.
# Install with:  (crontab -l 2>/dev/null; echo "15 2 * * * /var/www/optimas/deploy/backup-db.sh") | crontab -
# Restore with:  gunzip -c ~/backups/optimas-YYYY-MM-DD.sql.gz | psql "$DATABASE_URL"
set -euo pipefail

ENV_FILE="$(dirname "$0")/../backend/.env"
DATABASE_URL="$(grep -E '^DATABASE_URL=' "$ENV_FILE" | cut -d= -f2-)"
BACKUP_DIR="${BACKUP_DIR:-$HOME/backups}"

mkdir -p "$BACKUP_DIR"
pg_dump --no-owner "$DATABASE_URL" | gzip > "$BACKUP_DIR/optimas-$(date +%F).sql.gz"
find "$BACKUP_DIR" -name 'optimas-*.sql.gz' -mtime +14 -delete
