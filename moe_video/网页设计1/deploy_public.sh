#!/bin/bash

# AutoDL 公网部署脚本
echo "开始部署到公网..."

# 更新系统
apt update

# 安装依赖
pip3 install flask flask-cors requests
npm install -g http-server

# 创建项目目录
mkdir -p /var/www/moe2
cp -r /root/* /var/www/moe2/
cd /var/www/moe2

# 设置权限
chown -R www-data:www-data /var/www/moe2
chmod -R 755 /var/www/moe2

# 配置Nginx
cat > /etc/nginx/sites-available/moe2 << 'EOF'
server {
    listen 80;
    server_name _;
    
    # 前端静态文件
    location / {
        root /var/www/moe2;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # 后端 API 代理
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        root /var/www/moe2;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# 启用站点
ln -sf /etc/nginx/sites-available/moe2 /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 重启Nginx
systemctl restart nginx

# 创建systemd服务
cat > /etc/systemd/system/moe2-backend.service << 'EOF'
[Unit]
Description=MOE2 Backend Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/moe2
Environment=PATH=/usr/bin:/usr/local/bin
ExecStart=/usr/bin/python3 app.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# 启动服务
systemctl daemon-reload
systemctl enable moe2-backend
systemctl start moe2-backend

# 检查服务状态
echo "检查服务状态..."
systemctl status moe2-backend
systemctl status nginx

# 显示访问信息
echo "部署完成！"
echo "访问地址: http://$(curl -s ifconfig.me)"
echo "后端API: http://$(curl -s ifconfig.me)/api/"
