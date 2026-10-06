# Production Deployment & Operations Guide

## 1. System Requirements

- **Operating System**: Ubuntu 22.04 LTS / Debian 12 / RHEL 9
- **Processor**: 2+ vCPU (4+ vCPU recommended for high concurrency)
- **Memory**: 4 GB RAM minimum (8 GB recommended)
- **Disk**: 40 GB+ NVMe SSD
- **Software**: Docker Engine 24.0+ and Docker Compose v2.20+

---

## 2. Environment Preparation

1. Clone the repository into `/opt/pavilion`:
   ```bash
   git clone <repo-url> /opt/pavilion
   cd /opt/pavilion
   ```

2. Copy the production environment template:
   ```bash
   cp .env.example .env
   ```

3. Generate secure cryptographic secrets:
   ```bash
   openssl rand -hex 32  # Use for SECRET_KEY
   openssl rand -hex 32  # Use for JWT_SECRET_KEY
   openssl rand -base64 16 # Use for MYSQL_ROOT_PASSWORD & MYSQL_PASSWORD
   ```

4. Populate `.env` with production domain name and database passwords:
   ```ini
   APP_ENV=production
   DEBUG=false
   DOMAIN_NAME=pavilionrealty.com
   SECRET_KEY=<generated-key>
   JWT_SECRET_KEY=<generated-jwt-key>
   MYSQL_PASSWORD=<generated-db-pass>
   MYSQL_ROOT_PASSWORD=<generated-root-pass>
   REDIS_PASSWORD=<generated-redis-pass>
   INITIAL_ADMIN_EMAIL=admin@pavilionrealty.com
   INITIAL_ADMIN_PASSWORD=SuperStrongAdminPassword2025!
   ```

---

## 3. SSL / HTTPS Setup with Let's Encrypt

1. Install Certbot on the host:
   ```bash
   sudo apt-get update && sudo apt-get install -y certbot
   ```

2. Generate certificates for your domain:
   ```bash
   sudo certbot certonly --standalone -d pavilionrealty.com -d www.pavilionrealty.com
   ```

3. Certbot places certificates at `/etc/letsencrypt/live/pavilionrealty.com/`, which are mounted automatically into Nginx in `docker-compose.production.yml`.

---

## 4. Launching the Platform via Docker

1. Build containers and start services:
   ```bash
   docker-compose -f docker-compose.production.yml up -d --build
   ```

2. Check status of all containers:
   ```bash
   docker-compose -f docker-compose.production.yml ps
   ```

3. Run initial database migration:
   ```bash
   docker-compose -f docker-compose.production.yml exec backend alembic upgrade head
   ```

4. Seed default luxury inventory, roles, and initial super admin:
   ```bash
   docker-compose -f docker-compose.production.yml exec backend python ../scripts/seed.py
   ```

---

## 5. Health Checks & Verification

Verify platform operational status:
```bash
curl -i http://localhost/health
```
Expected output:
```json
{
  "status": "healthy",
  "database": "connected",
  "redis": "connected",
  "environment": "production"
}
```

---

## 6. Automated Backup Strategy

1. Backups are created using `scripts/backup.sh`.
2. Schedule a daily automated cron job:
   ```bash
   sudo crontab -e
   ```
   Add the following line to run every day at 02:00 AM UTC:
   ```cron
   0 2 * * * /opt/pavilion/scripts/backup.sh >> /var/log/pavilion_backup.log 2>&1
   ```

### Restoring from Backup
```bash
/opt/pavilion/scripts/restore.sh /backups/realestate_db_backup_20261006_020000.sql.gz
```
