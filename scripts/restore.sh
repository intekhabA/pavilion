#!/usr/bin/env bash
set -e

# Pavilion Realty MySQL Database Restore Utility
if [ -z "$1" ]; then
  echo "Usage: $0 <path-to-backup-file.sql.gz>"
  exit 1
fi

BACKUP_FILE="$1"
if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: Backup file '$BACKUP_FILE' does not exist."
  exit 1
fi

MYSQL_HOST="${MYSQL_HOST:-mysql}"
MYSQL_PORT="${MYSQL_PORT:-3306}"
MYSQL_DATABASE="${MYSQL_DATABASE:-realestate_db}"
MYSQL_USER="${MYSQL_USER:-realestate_user}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:-realestate_secret}"

echo "==> Restoring MySQL database ${MYSQL_DATABASE} from: ${BACKUP_FILE}..."

gunzip -c "$BACKUP_FILE" | mysql \
  --host="$MYSQL_HOST" \
  --port="$MYSQL_PORT" \
  --user="$MYSQL_USER" \
  --password="$MYSQL_PASSWORD" \
  "$MYSQL_DATABASE"

echo "==> Database restore completed successfully!"
