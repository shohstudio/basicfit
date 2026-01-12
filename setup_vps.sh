#!/bin/bash
set -e

echo "Starting VPS Setup..."

# System Update
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
# apt-get upgrade -y # Skip upgrade to save time, or do it if needed

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install tools
apt-get install -y nginx git

# Install PM2
npm install -g pm2

# Clear previous repo if exists (fresh start)
rm -rf /var/www/basicfit
mkdir -p /var/www/basicfit

# Clone Repo
echo "Cloning repository..."
git clone https://github.com/shohstudio/basicfit.git /var/www/basicfit

# Setup App
cd /var/www/basicfit
# Create .env
echo 'DATABASE_URL="file:./dev.db"' > .env

echo "Installing dependencies..."
npm install

echo "Initializing Database..."
npx prisma generate
npx prisma db push

echo "Building application..."
npm run build

# Start PM2
echo "Starting Application with PM2..."
pm2 stop basicfit || true
pm2 delete basicfit || true
pm2 start npm --name "basicfit" -- start

# Save PM2 list
pm2 save
pm2 startup systemd | bash || true

# Setup Nginx
echo "Configuring Nginx..."
cat > /etc/nginx/sites-available/basicfit << 'EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/basicfit /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

echo "DEPLOYMENT COMPLETE!"
