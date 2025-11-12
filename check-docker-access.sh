#!/bin/bash

# Script để kiểm tra Docker access trên Jenkins server
# Chạy script này trên Jenkins server để kiểm tra

echo "=========================================="
echo "Checking Docker Access for Jenkins"
echo "=========================================="
echo ""

# Check current user
echo "Current user: $(whoami)"
echo ""

# Check if user is in docker group
if groups | grep -q docker; then
  echo "✅ User is in docker group"
else
  echo "❌ User is NOT in docker group"
  echo "   Run: sudo usermod -aG docker jenkins"
fi
echo ""

# Check Docker socket permissions
if [ -S /var/run/docker.sock ]; then
  echo "Docker socket: /var/run/docker.sock"
  ls -la /var/run/docker.sock | awk '{print "  Permissions: " $1 " Owner: " $3 ":" $4}'
  
  if [ -r /var/run/docker.sock ] && [ -w /var/run/docker.sock ]; then
    echo "✅ Docker socket is readable and writable"
  else
    echo "❌ Docker socket is NOT accessible"
  fi
else
  echo "❌ Docker socket not found"
fi
echo ""

# Test docker command
echo "Testing docker ps..."
if docker ps &>/dev/null; then
  echo "✅ Docker command works!"
  docker ps
else
  echo "❌ Docker command failed"
  echo "Error: $(docker ps 2>&1 | head -1)"
fi
echo ""

# Test sudo docker
if command -v sudo &> /dev/null; then
  echo "Testing sudo docker ps..."
  if sudo -n docker ps &>/dev/null 2>&1; then
    echo "✅ Sudo docker works (no password needed)"
  elif sudo docker ps &>/dev/null 2>&1; then
    echo "⚠️  Sudo docker works but requires password"
  else
    echo "❌ Sudo docker failed"
  fi
else
  echo "⚠️  Sudo not available"
fi
echo ""

echo "=========================================="
echo "Recommendations:"
echo "=========================================="
echo ""
echo "Option 1 (Recommended): Add jenkins to docker group"
echo "  sudo usermod -aG docker jenkins"
echo "  sudo systemctl restart jenkins"
echo ""
echo "Option 2: Configure sudo without password"
echo "  sudo visudo"
echo "  Add line: jenkins ALL=(ALL) NOPASSWD: /usr/bin/docker"
echo "  sudo systemctl restart jenkins"
echo ""

