#!/usr/bin/env bash
set -e

# Pavilion Realty MySQL Database Backup Utility
BACKUP_DIR="${BACKUP_DIR:-/backups}"
mkdir -p "$BACKUP_DIR"

MYSQL_HOST="${MYSQL_HOST:-mysql}"
MYSQL_PORT="${MYSQL_PORT:-3306}"
MYSQL_DATABASE="${MYSQL_DATABASE:-realestate_db}"
MYSQL_USER="${MYSQL_USER:-realestate_user}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:-realestate_secret}"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/${MYSQL_DATABASE}_backup_${TIMESTAMP}.sql.gz"

echo "==> Starting MySQL backup of ${MYSQL_DATABASE} from ${MYSQL_HOST}:${MYSQL_PORT}..."

mysqldump \
  --host="$MYSQL_HOST" \
  --port="$MYSQL_PORT" \
  --user="$MYSQL_USER" \
  --password="$MYSQL_PASSWORD" \
  --single-transaction \
  --quick \
  --lock-tables=false \
  --routines \
  --triggers \
  "$MYSQL_DATABASE" | gzip > "$BACKUP_FILE"

echo "==> Backup successfully created at: ${BACKUP_FILE}"
echo "==> File size: $(du -h "$BACKUP_FILE" | cut -f1)"

# Keep last 14 days of backups
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +14 -exec rm {} \; 2>/dev/null || true
echo "==> Backup retention policy enforced (14 days)."
