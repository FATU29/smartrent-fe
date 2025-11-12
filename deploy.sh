#!/bin/bash

# Deploy script - Build, push và deploy lên server
# Usage: ./deploy.sh

set -e

# Cấu hình
DOCKER_USER="fatu29"
DOCKER_TOKEN="${DOCKER_TOKEN}"
IMAGE_NAME="front-end"
SSH_HOST="root@143.198.222.6"
CONTAINER_NAME="front-end"
CONTAINER_PORT="8080"

# Lấy commit hash làm tag
COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "latest")
IMAGE_TAG="${DOCKER_USER}/${IMAGE_NAME}:${COMMIT}"

echo "=========================================="
echo "Deploy SmartRent FE"
echo "=========================================="
echo "Image: ${IMAGE_TAG}"
echo "Commit: ${COMMIT}"
echo ""

# Kiểm tra Docker và quyền
if ! command -v docker &> /dev/null; then
  echo "❌ Error: Docker not found"
  exit 1
fi

# Kiểm tra quyền Docker, nếu không có thì dùng sudo
DOCKER_CMD="docker"
if ! docker ps &>/dev/null; then
  if command -v sudo &> /dev/null && sudo docker ps &>/dev/null; then
    echo "⚠️  Using sudo for Docker commands"
    DOCKER_CMD="sudo docker"
  else
    echo "❌ Error: No permission to access Docker. Add user to docker group or configure sudo."
    exit 1
  fi
fi

# Kiểm tra token
if [[ -z "$DOCKER_TOKEN" ]]; then
  echo "❌ Error: DOCKER_TOKEN not set"
  exit 1
fi

# 1. Login Docker (local)
echo "📦 Logging in to Docker..."
echo "$DOCKER_TOKEN" | $DOCKER_CMD login -u "$DOCKER_USER" --password-stdin || {
  echo "❌ Docker login failed. Check DOCKER_TOKEN."
  exit 1
}

# 2. Build image
echo "🔨 Building image..."
$DOCKER_CMD build -t "$IMAGE_TAG" -t "${DOCKER_USER}/${IMAGE_NAME}:latest" .

# 3. Push image
echo "⬆️  Pushing image..."
$DOCKER_CMD push "$IMAGE_TAG"
$DOCKER_CMD push "${DOCKER_USER}/${IMAGE_NAME}:latest"

echo ""
echo "✅ Image pushed!"
echo ""

# 4. Deploy lên server qua SSH
echo "🚀 Deploying to server: ${SSH_HOST}"

ssh "$SSH_HOST" << EOF
  # Login Docker trên server (cần để pull image private)
  echo "$DOCKER_TOKEN" | docker login -u "$DOCKER_USER" --password-stdin
  
  # Pull image mới
  echo "📥 Pulling image..."
  docker pull "$IMAGE_TAG" || docker pull "${DOCKER_USER}/${IMAGE_NAME}:latest"
  
  # Dừng container cũ
  echo "🛑 Stopping old container..."
  docker stop ${CONTAINER_NAME} 2>/dev/null || true
  docker rm ${CONTAINER_NAME} 2>/dev/null || true
  
  # Chạy container mới
  echo "▶️  Starting new container..."
  docker run -d \\
    --name ${CONTAINER_NAME} \\
    --restart unless-stopped \\
    -p ${CONTAINER_PORT}:${CONTAINER_PORT} \\
    "$IMAGE_TAG" || docker run -d \\
    --name ${CONTAINER_NAME} \\
    --restart unless-stopped \\
    -p ${CONTAINER_PORT}:${CONTAINER_PORT} \\
    "${DOCKER_USER}/${IMAGE_NAME}:latest"
  
  # Kiểm tra
  sleep 2
  docker ps | grep ${CONTAINER_NAME} && echo "✅ Container running!" || echo "⚠️  Container may not be running"
EOF

# 5. Setup nginx (nếu có file config)
if [ -f "nginx-site.conf" ]; then
  echo ""
  echo "⚙️  Setting up nginx..."
  scp nginx-site.conf "$SSH_HOST:/etc/nginx/sites-available/front-end" 2>/dev/null || echo "⚠️  Could not copy nginx config"
  
  ssh "$SSH_HOST" << 'NGINX_EOF'
    ln -sf /etc/nginx/sites-available/front-end /etc/nginx/sites-enabled/front-end 2>/dev/null || true
    nginx -t && systemctl reload nginx && echo "✅ Nginx reloaded" || echo "⚠️  Nginx reload failed"
NGINX_EOF
fi

echo ""
echo "=========================================="
echo "✅ Deploy completed!"
echo "=========================================="
echo "Server: ${SSH_HOST}"
echo "App: http://143.198.222.6:${CONTAINER_PORT}"
[ -f "nginx-site.conf" ] && echo "Nginx: http://143.198.222.6"
echo ""
