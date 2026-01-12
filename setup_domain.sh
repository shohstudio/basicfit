#!/bin/bash
set -e

DOMAIN="bigreader.uz"
EMAIL="info@bigreader.uz" # Placeholder email

echo "Configuring Domain: $DOMAIN"

# Update Nginx Config
cat > /etc/nginx/sites-available/basicfit << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

nginx -t
systemctl reload nginx

# Install Certbot
echo "Installing Certbot..."
apt-get install -y certbot python3-certbot-nginx

# Obtain SSL
echo "Obtaining SSL Certificate..."
certbot --nginx --non-interactive --agree-tos -m $EMAIL -d $DOMAIN -d www.$DOMAIN

echo "DOMAIN SETUP COMPLETE!"
