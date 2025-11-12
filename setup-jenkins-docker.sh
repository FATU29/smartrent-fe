#!/bin/bash

# Script để cấu hình Docker access cho Jenkins user
# Chạy script này trên Jenkins server với quyền root/sudo

set -e

echo "=========================================="
echo "Setup Docker Access for Jenkins"
echo "=========================================="
echo ""

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
  echo "❌ Please run as root or with sudo"
  echo "Usage: sudo ./setup-jenkins-docker.sh"
  exit 1
fi

JENKINS_USER="jenkins"

# Check if jenkins user exists
if ! id "$JENKINS_USER" &>/dev/null; then
  echo "❌ Jenkins user not found: $JENKINS_USER"
  exit 1
fi

echo "Configuring Docker access for user: $JENKINS_USER"
echo ""

# Option 1: Add jenkins to docker group
echo "Step 1: Adding $JENKINS_USER to docker group..."
if groups "$JENKINS_USER" | grep -q docker; then
  echo "✅ $JENKINS_USER is already in docker group"
else
  usermod -aG docker "$JENKINS_USER"
  echo "✅ Added $JENKINS_USER to docker group"
fi
echo ""

# Option 2: Configure sudo without password for docker
echo "Step 2: Configuring sudo for docker commands..."
SUDOERS_FILE="/etc/sudoers.d/jenkins-docker"
SUDOERS_LINE="$JENKINS_USER ALL=(ALL) NOPASSWD: /usr/bin/docker"

if [ -f "$SUDOERS_FILE" ] && grep -q "$SUDOERS_LINE" "$SUDOERS_FILE"; then
  echo "✅ Sudo configuration already exists"
else
  echo "$SUDOERS_LINE" > "$SUDOERS_FILE"
  chmod 0440 "$SUDOERS_FILE"
  echo "✅ Created sudo configuration: $SUDOERS_FILE"
fi
echo ""

# Check Docker socket permissions
echo "Step 3: Checking Docker socket permissions..."
if [ -S /var/run/docker.sock ]; then
  DOCKER_GROUP=$(stat -c '%G' /var/run/docker.sock)
  echo "Docker socket group: $DOCKER_GROUP"
  
  if [ "$DOCKER_GROUP" = "docker" ]; then
    echo "✅ Docker socket has correct group"
  else
    echo "⚠️  Docker socket group is '$DOCKER_GROUP', expected 'docker'"
    echo "   You may need to restart Docker: sudo systemctl restart docker"
  fi
else
  echo "❌ Docker socket not found at /var/run/docker.sock"
fi
echo ""

# Restart Jenkins
echo "Step 4: Restarting Jenkins..."
if systemctl is-active --quiet jenkins; then
  systemctl restart jenkins
  echo "✅ Jenkins restarted"
else
  echo "⚠️  Jenkins service not running, starting it..."
  systemctl start jenkins || echo "⚠️  Could not start Jenkins service"
fi
echo ""

echo "=========================================="
echo "✅ Configuration completed!"
echo "=========================================="
echo ""
echo "Verification:"
echo "  Run as jenkins user:"
echo "    sudo -u jenkins docker ps"
echo ""
echo "If it works, your Jenkins pipeline should now have Docker access."
echo ""

