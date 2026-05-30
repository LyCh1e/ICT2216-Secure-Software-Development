#!/bin/sh
# Daily MySQL backup for TrialGuard — main DB and vault DB.
# Keeps the 7 most recent backups of each; older files are deleted.
set -e

BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "[$(date -u +%FT%TZ)] Starting backup…"

mysqldump \
    -h mysql \
    -u"${DB_USER}" \
    -p"${DB_PASS}" \
    "${DB_NAME}" \
  > "${BACKUP_DIR}/main_${TIMESTAMP}.sql"

mysqldump \
    -h vault_db \
    -u"${VAULT_DB_USER}" \
    -p"${VAULT_DB_PASS}" \
    "${VAULT_DB_NAME}" \
  > "${BACKUP_DIR}/vault_${TIMESTAMP}.sql"

# Rotate: keep only the 7 most recent dumps of each database
ls -t "${BACKUP_DIR}"/main_*.sql  2>/dev/null | tail -n +8 | xargs -r rm -f
ls -t "${BACKUP_DIR}"/vault_*.sql 2>/dev/null | tail -n +8 | xargs -r rm -f

echo "[$(date -u +%FT%TZ)] Backup complete: main_${TIMESTAMP}.sql, vault_${TIMESTAMP}.sql"
