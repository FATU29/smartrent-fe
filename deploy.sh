#!/bin/bash

# Deploy script - Build, push với tag commit và latest
set -e

# Cấu hình
DOCKER_USER="fatu29"
DOCKER_TOKEN="${DOCKER_TOKEN}"
IMAGE_NAME="front-end"
SSH_HOST="root@143.198.222.6"
CONTAINER_NAME="front-end"
CONTAINER_PORT="3001"

# Lấy commit hash
COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "latest")
IMAGE_COMMIT="${DOCKER_USER}/${IMAGE_NAME}:${COMMIT}"
IMAGE_LATEST="${DOCKER_USER}/${IMAGE_NAME}:latest"

echo "=========================================="
echo "Deploy SmartRent FE"
echo "=========================================="
echo "Commit: ${COMMIT}"
echo "Image: ${IMAGE_COMMIT}"
echo "Latest: ${IMAGE_LATEST}"
echo ""

# Kiểm tra Docker
if ! command -v docker &> /dev/null; then
  echo "❌ Error: Docker not found"
  exit 1
fi

# Kiểm tra token
if [[ -z "$DOCKER_TOKEN" ]]; then
  echo "❌ Error: DOCKER_TOKEN not set"
  exit 1
fi

# Kiểm tra quyền Docker
DOCKER_CMD="docker"
if ! docker ps &>/dev/null 2>&1; then
  if command -v sudo &> /dev/null && sudo -n docker ps &>/dev/null 2>&1; then
    DOCKER_CMD="sudo docker"
  else
    echo "❌ Error: No Docker permission"
    echo "Fix: sudo usermod -aG docker jenkins && sudo systemctl restart jenkins"
    exit 1
  fi
fi

# 1. Login Docker
echo "📦 Logging in to Docker..."
echo "$DOCKER_TOKEN" | $DOCKER_CMD login -u "$DOCKER_USER" --password-stdin

# 2. Build image với 2 tags: commit và latest
echo "🔨 Building image..."
$DOCKER_CMD build -t "$IMAGE_COMMIT" -t "$IMAGE_LATEST" .

# 3. Push cả 2 tags
echo "⬆️  Pushing image with commit tag..."
$DOCKER_CMD push "$IMAGE_COMMIT"

echo "⬆️  Pushing image with latest tag..."
$DOCKER_CMD push "$IMAGE_LATEST"

echo ""
echo "✅ Image pushed!"
echo ""

# 4. Deploy lên server
echo "🚀 Deploying to server: ${SSH_HOST}"

ssh -o StrictHostKeyChecking=no "$SSH_HOST" bash << EOF
set -e

echo "$DOCKER_TOKEN" | docker login -u "$DOCKER_USER" --password-stdin

echo "📥 Pulling image..."
docker pull "$IMAGE_COMMIT" || docker pull "$IMAGE_LATEST"

echo "🛑 Stopping old container..."
docker stop ${CONTAINER_NAME} 2>/dev/null || true
docker rm ${CONTAINER_NAME} 2>/dev/null || true

echo "▶️  Starting new container..."
docker run -d \\
  --name ${CONTAINER_NAME} \\
  --restart unless-stopped \\
  -p ${CONTAINER_PORT}:3000 \\
  "$IMAGE_COMMIT" || docker run -d \\
  --name ${CONTAINER_NAME} \\
  --restart unless-stopped \\
  -p ${CONTAINER_PORT}:3000 \\
  "$IMAGE_LATEST"

sleep 3
docker ps | grep ${CONTAINER_NAME} && echo "✅ Container running!" || {
  echo "⚠️  Container may not be running"
  docker logs --tail 30 ${CONTAINER_NAME} 2>&1 || true
  exit 1
}
EOF

echo ""
echo "=========================================="
echo "✅ Deploy completed!"
echo "=========================================="
echo "Server: ${SSH_HOST}"
echo "App: http://143.198.222.6:${CONTAINER_PORT}"
echo ""
