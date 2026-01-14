# VPS Deployment Guide (DigitalOcean Droplet)

This guide covers deploying Paste-Bin to a DigitalOcean Droplet (VPS) using Docker Compose.

## Why VPS over App Platform?

- ✅ **Cheaper**: ~$6-12/month vs $20-30/month
- ✅ **Full Control**: Complete access to your environment
- ✅ **Simple**: Use your existing docker-compose setup
- ✅ **Database Included**: PostgreSQL runs alongside your app
- ✅ **No Changes Needed**: Your code is already ready!

---

## Prerequisites

- DigitalOcean account
- GitHub repository with your code
- Domain name (optional, can use IP address)

---

## Step 1: Create a Droplet

1. **Go to DigitalOcean Dashboard**
   - Navigate to: https://cloud.digitalocean.com/droplets

2. **Create Droplet**
   - Click "Create" → "Droplets"

3. **Choose Configuration**:
   - **Image**: Ubuntu 24.04 LTS (or latest)
   - **Plan**: 
     - Basic: $6/month (1GB RAM, 1 vCPU) - Good for testing
     - **Recommended**: $12/month (2GB RAM, 1 vCPU) - Better for production
   - **Datacenter**: Choose closest to your users
   - **Authentication**: 
     - **Recommended**: SSH Key (more secure)
     - Alternative: Password
   - **Hostname**: `pastebin-prod` or similar

4. **Create the Droplet**
   - Click "Create Droplet"
   - Wait ~60 seconds for it to spin up
   - **Note the IP address** (e.g., 167.99.123.45)

---

## Step 2: Initial Server Setup

### Connect to Your Server

```bash
# Replace with your droplet's IP
ssh root@167.99.123.45
```

### Update System

```bash
apt update && apt upgrade -y
```

### Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Start Docker
systemctl start docker
systemctl enable docker

# Verify installation
docker --version
docker compose version
```

### Install Git

```bash
apt install -y git
```

### Create Non-Root User (Optional but Recommended)

```bash
# Create user
adduser deploy
usermod -aG sudo deploy
usermod -aG docker deploy

# Switch to new user
su - deploy
```

---

## Step 3: Setup Firewall

```bash
# Allow SSH
ufw allow OpenSSH

# Allow HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw --force enable

# Check status
ufw status
```

---

## Step 4: Clone Your Repository

```bash
# Navigate to home directory
cd ~

# Clone repository
git clone https://github.com/Abdullah-AboOun/Paste-Bin.git
cd Paste-Bin
```

---

## Step 5: Configure Environment

```bash
# Create production environment file
cp .env.prod.example .env.prod

# Edit with secure values
nano .env.prod
```

**Update these values:**
```bash
# Generate a secure password
POSTGRES_PASSWORD=$(openssl rand -base64 32)

# Your .env.prod should look like:
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=app
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
PORT=3000
```

**Save and secure the file:**
```bash
chmod 600 .env.prod
```

---

## Step 6: Deploy Application

### Build and Start Services

```bash
# Build images
docker compose -f docker-compose.yml -f docker-compose.prod.yml build

# Start services in background
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod up -d

# Check status
docker compose ps
```

### Run Database Migrations

```bash
# Wait for services to be healthy (30-60 seconds)
sleep 30

# Run migrations
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec app bun run db:push
```

### Verify Deployment

```bash
# Check health endpoint
curl http://localhost:3000/api/health

# Should return: {"status":"healthy"}

# View logs
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f
```

---

## Step 7: Setup Nginx Reverse Proxy (Optional)

This allows you to:
- Use a domain name instead of IP:3000
- Add SSL/HTTPS
- Serve on port 80/443

### Install Nginx

```bash
apt install -y nginx
```

### Configure Nginx

```bash
# Create config
nano /etc/nginx/sites-available/pastebin
```

**Add this configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;  # Or use your IP

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
```

**Enable the site:**
```bash
# Create symlink
ln -s /etc/nginx/sites-available/pastebin /etc/nginx/sites-enabled/

# Test configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

Now your app is accessible at: http://your-domain.com

---

## Step 8: Setup SSL with Let's Encrypt (Optional)

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get certificate (replace with your domain)
certbot --nginx -d your-domain.com -d www.your-domain.com

# Follow prompts to:
# 1. Enter email
# 2. Agree to terms
# 3. Choose to redirect HTTP to HTTPS (recommended)

# Test auto-renewal
certbot renew --dry-run
```

Your app is now accessible at: https://your-domain.com 🎉

---

## Step 9: Setup Auto-Deployment (Optional)

Create a deployment script for easy updates:

```bash
# Create deploy script
nano ~/deploy.sh
```

**Add this content:**
```bash
#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Navigate to project
cd ~/Paste-Bin

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Rebuild and restart
echo "🔨 Rebuilding services..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml build

echo "🔄 Restarting services..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod up -d

# Run migrations
echo "📊 Running migrations..."
sleep 10
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec -T app bun run db:push

echo "✅ Deployment complete!"
```

**Make it executable:**
```bash
chmod +x ~/deploy.sh
```

**To deploy updates:**
```bash
~/deploy.sh
```

---

## Using Makefile Commands

If `make` is installed on your server:

```bash
# Build for production
make prod-build

# Start production services
make prod-up

# View logs
make prod-logs

# Run migrations
make prod-migrate

# Backup database
make prod-backup

# Restart services
make prod-restart

# Stop services
make prod-down
```

---

## Monitoring and Maintenance

### Check Service Health

```bash
# Check running containers
docker compose ps

# View logs
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

# Check health endpoint
curl http://localhost:3000/api/health
```

### View Resource Usage

```bash
# Docker stats
docker stats

# System resources
htop  # Install with: apt install htop
```

### Database Backups

```bash
# Manual backup
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec -T db pg_dump -U postgres app > backup_$(date +%Y%m%d).sql

# Or use Makefile
make prod-backup
```

**Setup Automated Backups:**
```bash
# Create backup script
nano ~/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR=~/backups
mkdir -p $BACKUP_DIR
cd ~/Paste-Bin
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec -T db pg_dump -U postgres app | gzip > $BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
```

```bash
chmod +x ~/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * ~/backup-db.sh
```

---

## Troubleshooting

### Services Won't Start

```bash
# Check logs
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs

# Check disk space
df -h

# Check if ports are in use
netstat -tulpn | grep :3000
```

### Database Connection Issues

```bash
# Check database is running
docker compose ps db

# Check database logs
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs db

# Verify environment variables
docker compose -f docker-compose.yml -f docker-compose.prod.yml config
```

### App Crashes or Restarts

```bash
# View app logs
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs app

# Check container restart count
docker compose ps

# Inspect container
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec app sh
```

---

## Scaling and Performance

### Vertical Scaling (More Resources)

Go to DigitalOcean → Droplets → Your Droplet → Resize
- Choose larger plan
- Power off droplet
- Resize
- Power on

### Horizontal Scaling (Multiple Instances)

For high traffic, consider:
1. Load balancer
2. Multiple app instances
3. Separate database server

---

## Security Best Practices

### Keep System Updated

```bash
# Run monthly
apt update && apt upgrade -y
docker compose pull
~/deploy.sh
```

### Setup Fail2Ban (Prevent Brute Force)

```bash
apt install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```

### Change SSH Port (Optional)

```bash
nano /etc/ssh/sshd_config
# Change: Port 22 → Port 2222
systemctl restart sshd

# Update firewall
ufw allow 2222/tcp
ufw delete allow OpenSSH
```

### Regular Backups

- Database: Automated daily backups
- Code: Git repository (already backed up)
- Environment files: Keep secure offline copies

---

## Cost Breakdown

**Monthly Costs:**
- Droplet (2GB): $12/month
- Bandwidth: Free (1TB included)
- Backups (optional): $2.40/month (20% of droplet cost)

**Total: ~$12-15/month** 💰

---

## Quick Reference

### Essential Commands

```bash
# Deploy updates
cd ~/Paste-Bin && git pull && ~/deploy.sh

# View logs
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

# Restart services
docker compose -f docker-compose.yml -f docker-compose.prod.yml restart

# Check health
curl http://localhost:3000/api/health

# Backup database
make prod-backup
```

### File Locations

- **App**: `~/Paste-Bin/`
- **Environment**: `~/Paste-Bin/.env.prod`
- **Nginx Config**: `/etc/nginx/sites-available/pastebin`
- **SSL Certs**: `/etc/letsencrypt/`
- **Backups**: `~/backups/`

---

## Next Steps

1. ✅ Deploy your app
2. ✅ Setup domain and SSL
3. ✅ Configure automated backups
4. ✅ Setup monitoring alerts
5. ✅ Test deployment script

**Your app is now running in production!** 🎉

For questions or issues, check the logs first:
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f
```
