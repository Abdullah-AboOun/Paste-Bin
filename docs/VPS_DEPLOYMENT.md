# VPS Deployment Guide

Deploy Paste-Bin to any VPS (Virtual Private Server) using Docker Compose. Everything runs in Docker containers on a single server.

**Compatible with**: DigitalOcean, AWS EC2, Linode, Vultr, Hetzner Cloud, and any Ubuntu/Debian VPS.

## What You Get

- Complete application running on one VPS
- PostgreSQL database in Docker
- Automatic SSL/HTTPS with Let's Encrypt
- ~$6-12/month total cost

## Quick Start

```bash
# On your VPS (after setup below):
git clone https://github.com/Abdullah-AboOun/Paste-Bin.git /opt/paste-bin
cd /opt/paste-bin
cp .env.prod.example .env.prod
nano .env.prod  # Edit with your secure password
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod up -d
```

## Step-by-Step Deployment

### 1. Create VPS Server

Create a server with your preferred VPS provider:

**Minimum Requirements**:
- **OS**: Ubuntu 24.04 LTS or 22.04 LTS (recommended)
- **RAM**: 2GB (minimum 1GB, first build takes 15-30 min on 1GB)
- **CPU**: 1 vCPU
- **Storage**: 25GB
- **Authentication**: SSH key (recommended) or password

**⚠️ Note**: First deployment will build the Docker image on the VPS, which takes 15-30 minutes on a 1GB RAM server. See "Fast Deployment Options" below to skip building on the VPS.

**Popular Providers**:
- [DigitalOcean](https://www.digitalocean.com/) - Droplets from $6-12/month
- [AWS Lightsail](https://aws.amazon.com/lightsail/) - From $5/month
- [Linode](https://www.linode.com/) - From $5/month
- [Vultr](https://www.vultr.com/) - From $6/month
- [Hetzner Cloud](https://www.hetzner.com/cloud) - From €4.5/month

### 2. Initial Server Setup

```bash
# SSH into your server (replace with your server's IP)
ssh root@your_server_ip

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh

# Verify Docker installation
docker --version
docker compose version

# Install git
apt install -y git
```

### 3. Setup Firewall

```bash
apt install -y ufw
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ufw status
```

### 4. Clone and Configure

```bash
# Clone repository
git clone https://github.com/Abdullah-AboOun/Paste-Bin.git /opt/paste-bin
cd /opt/paste-bin

# Copy environment file
cp .env.prod.example .env.prod

# Edit environment variables
nano .env.prod
```

**Important**: Change these values in `.env.prod`:
```env
POSTGRES_PASSWORD=your_strong_password_here
# Note: DATABASE_URL is automatically generated from POSTGRES_PASSWORD
```

### 5. Deploy Application

```bash
# Start services (will build image first time, takes 15-30 min on 1GB RAM)
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod up -d

# Check build progress
docker compose logs -f

# Once complete, check status
docker compose ps

# Test health endpoint
curl http://localhost:3000/api/health
```

Visit `http://your_server_ip:3000` - your app is live!

### 5a. Fast Deployment Options (Skip Building on VPS)

**Option A: Use Pre-built Image from Docker Hub**

If the image is available on Docker Hub, you can skip the slow build:

```bash
# Pull pre-built image (instant)
docker pull yourusername/paste-bin:latest

# Deploy using the pre-built image
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod up -d
```

**Option B: Build Locally and Push**

Build on your faster local machine, then pull on VPS:

```bash
# On your local machine:
docker build -t yourusername/paste-bin:latest .
docker login
docker push yourusername/paste-bin:latest

# On VPS:
docker pull yourusername/paste-bin:latest
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod up -d
```

**Option C: Add Swap Space for Faster Builds**

If building on VPS with 1GB RAM, add swap to improve build speed:

```bash
# Add 2GB swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verify
free -h
```

### 6. Setup Domain + HTTPS (Recommended)

**Point your domain to the server**:
- Add an A record pointing to your server IP
- Wait for DNS propagation (5-30 minutes)

**Install Nginx**:
```bash
apt install -y nginx certbot python3-certbot-nginx
```

**Configure Nginx**:
```bash
cat > /etc/nginx/sites-available/paste-bin << 'EOF'
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

ln -s /etc/nginx/sites-available/paste-bin /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

**Get SSL certificate**:
```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Done! Your app is now at `https://yourdomain.com` 🎉

## Daily Operations

### View Logs
```bash
docker compose logs -f       # All services
docker compose logs -f web   # Just app
docker compose logs -f db    # Just database
```

### Restart
```bash
docker compose restart       # All services
docker compose restart web   # Just app
```

### Update Code
```bash
cd /opt/paste-bin
git pull origin main
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

### Backup Database
```bash
# Create backup
docker compose exec db pg_dump -U postgres app > backup-$(date +%Y%m%d).sql

# Restore backup
docker compose exec -T db psql -U postgres app < backup-20260114.sql
```

## Troubleshooting

**Can't access the app**:
```bash
docker compose ps           # Check if running
docker compose logs        # Check for errors
ufw status                # Check firewall
curl localhost:3000/api/health  # Test locally
```

**Database errors**:
```bash
docker compose exec db pg_isready -U postgres
docker compose exec db psql -U postgres -d app
```

**Out of disk space**:
```bash
df -h                      # Check disk usage
docker system prune -a     # Clean Docker
```

## Auto-Backup Setup (Optional)

```bash
# Create backup script
cat > /opt/backup-paste-bin.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/paste-bin-backups"
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d)
cd /opt/paste-bin
docker compose exec -T db pg_dump -U postgres app | gzip > $BACKUP_DIR/backup-$DATE.sql.gz
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
EOF

chmod +x /opt/backup-paste-bin.sh

# Run daily at 2 AM
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/backup-paste-bin.sh") | crontab -
```

## Security Hardening (Optional)

```bash
# Install fail2ban (prevents brute force)
apt install -y fail2ban
systemctl enable fail2ban

# Setup auto-updates
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

## Cost Breakdown

- **VPS (1GB)**: $6/month
- **VPS (2GB)**: $12/month
- **Domain**: ~$12/year (optional)
- **SSL**: Free (Let's Encrypt)

**Total**: $6-12/month

## Monitoring

Check resource usage:
```bash
docker stats              # Container resource usage
htop                     # System resources (apt install htop)
df -h                    # Disk space
```

## Scaling Up

When you need more power:

1. **Resize server**: Use your VPS provider's console to upgrade
2. **Add more servers**: Use load balancer + multiple servers
3. **Managed database**: Migrate to a managed PostgreSQL service

## Support

- [Make Commands](../Makefile) - `make help`
- [Docker Environments Guide](./DOCKER_ENVIRONMENTS.md)
- VPS Provider Documentation (check your provider's docs)
