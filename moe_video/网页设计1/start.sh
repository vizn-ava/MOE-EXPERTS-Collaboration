#!/bin/bash

# 启动脚本
cd /var/www/moe2

# 启动后端服务
nohup python3 app.py > backend.log 2>&1 &

# 启动前端服务
nohup npx http-server -p 5173 -c-1 > frontend.log 2>&1 &

echo "服务已启动"
echo "后端日志: tail -f /var/www/moe2/backend.log"
echo "前端日志: tail -f /var/www/moe2/frontend.log"
