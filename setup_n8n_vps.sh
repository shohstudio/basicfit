#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Starting n8n Installation with Docker ===${NC}"

# 1. Install Docker & Docker Compose
echo -e "${GREEN}Installing Docker...${NC}"
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Install Docker Compose Plugin (if not already installed by get-docker)
apt-get update
apt-get install -y docker-compose-plugin

# 2. Setup n8n Directory
echo -e "${GREEN}Setting up n8n configuration...${NC}"
mkdir -p /root/n8n
cd /root/n8n

# 3. Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_HOST=${DOMAIN_NAME}
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - NODE_ENV=production
      - WEBHOOK_URL=http://${DOMAIN_NAME}:5678/
      - GENERIC_TIMEZONE=Asia/Tashkent
      - N8N_SECURE_COOKIE=false
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  n8n_data:
    external: true

EOF

# Create volume if not exists
docker volume create n8n_data || true

# 4. Start n8n
echo -e "${GREEN}Starting n8n...${NC}"
# Get Public IP if DOMAIN_NAME var is not set
if [ -z "$DOMAIN_NAME" ]; then
    export DOMAIN_NAME=$(curl -s ifconfig.me)
fi

echo "Deploying on IP/Domain: $DOMAIN_NAME"
docker compose up -d

echo -e "${BLUE}=== Installation Complete! ===${NC}"
echo -e "Access n8n at: ${GREEN}http://$DOMAIN_NAME:5678${NC}"
echo -e "Webhook URL for .env: ${GREEN}http://$DOMAIN_NAME:5678/webhook/basicfit${NC}"
