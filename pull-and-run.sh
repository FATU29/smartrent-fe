#!/bin/bash

# Simple script to pull and run Docker image
# Usage: ./pull-and-run.sh [commit-hash]

set -e

DOCKER_USERNAME="${DOCKER_USERNAME:-fatu29}"
IMAGE_NAME="front-end"
COMMIT_HASH="${1:-latest}"
FULL_IMAGE_NAME="${DOCKER_USERNAME}/${IMAGE_NAME}:${COMMIT_HASH}"

echo "Pulling image: ${FULL_IMAGE_NAME}"
docker pull "${FULL_IMAGE_NAME}"

echo "Stopping old container (if exists)..."
docker stop front-end 2>/dev/null || true
docker rm front-end 2>/dev/null || true

echo "Starting container..."
docker run -d \
  --name front-end \
  -p 8080:8080 \
  "${FULL_IMAGE_NAME}"

echo "✅ Container started!"
echo "App available at: http://localhost:8080"

