#!/bin/bash

# AutoDL 部署脚本
echo "开始部署到 AutoDL..."

# 更新系统包
apt update

# 安装 Python 3 和 pip
apt install -y python3 python3-pip

# 安装 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# 安装 Nginx
apt install -y nginx

# 创建项目目录
mkdir -p /var/www/moe2
cd /var/www/moe2

# 复制项目文件（假设已经上传）
# 这里我们稍后会通过 scp 上传文件

# 安装 Python 依赖
pip3 install -r requirements.txt

# 安装 Node.js 依赖
npm install

# 构建前端（如果需要）
# npm run build

# 设置权限
chown -R www-data:www-data /var/www/moe2
chmod -R 755 /var/www/moe2

echo "部署完成！"
