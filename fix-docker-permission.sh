#!/bin/bash

# Script đơn giản để fix Docker permission cho Jenkins
# Chạy trên Jenkins server: sudo ./fix-docker-permission.sh

echo "Fixing Docker permission for Jenkins..."

# Thêm jenkins vào docker group
usermod -aG docker jenkins

# Cấu hình sudo không cần password
echo "jenkins ALL=(ALL) NOPASSWD: /usr/bin/docker" > /etc/sudoers.d/jenkins-docker
chmod 0440 /etc/sudoers.d/jenkins-docker

# Restart Jenkins
systemctl restart jenkins

echo "✅ Done! Jenkins restarted."
echo "Run pipeline again."

