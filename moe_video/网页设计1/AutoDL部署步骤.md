# AutoDL 部署步骤详细说明

## 项目概述
本项目是一个前后端分离的MOE专家协作挖掘可视化展示系统，包含：
- 前端：静态HTML页面 + http-server
- 后端：Flask API服务
- 内网穿透：cloudflared

## 部署环境
- 服务器：AutoDL容器
- 操作系统：Linux
- 前端端口：6006
- 后端端口：3001

## 详细部署步骤

### 第一步：准备项目文件

#### 1.1 上传项目到服务器
```bash
# 在本地创建压缩包
tar -czf moe2-project.tar.gz --exclude=node_modules --exclude=.git --exclude=*.log .

# 上传到AutoDL服务器
scp -P 15265 moe2-project.tar.gz root@connect.westc.gpuhub.com:/root/

# 连接服务器
ssh -p 15265 root@connect.westc.gpuhub.com

# 解压项目文件
cd /root
tar -xzf moe2-project.tar.gz
```

#### 1.2 安装系统依赖
```bash
# 更新系统包
apt update

# 安装Python和Node.js
apt install -y python3 python3-pip nodejs npm nginx
```

### 第二步：安装项目依赖

#### 2.1 安装Python依赖
```bash
pip3 install flask flask-cors requests
```

#### 2.2 安装Node.js依赖
```bash
npm install -g http-server
```

### 第三步：启动前端服务

#### 3.1 启动http-server
```bash
# 使用nohup后台运行
nohup npx http-server -p 6006 --host 0.0.0.0 > http-server.log 2>&1 &

# 检查服务状态
ps aux | grep http-server

# 测试本地访问
curl http://localhost:6006
```

#### 3.2 验证前端服务
```bash
# 检查端口监听
ss -tlnp | grep 6006

# 测试HTTP响应
curl -I http://localhost:6006
```

### 第四步：安装和配置cloudflared

#### 4.1 下载cloudflared
```bash
# 在本地下载cloudflared
# 访问：https://github.com/cloudflare/cloudflared/releases/latest
# 下载：cloudflared-linux-amd64

# 上传到服务器
scp -P 15265 cloudflared-linux-amd64 root@connect.westc.gpuhub.com:/root/autodl-tmp/cloudflared

# 设置权限
chmod +x /root/autodl-tmp/cloudflared
```

#### 4.2 启动cloudflared隧道
```bash
# 直接运行查看完整输出
/root/autodl-tmp/cloudflared tunnel --url http://localhost:6006

# 或者后台运行
nohup /root/autodl-tmp/cloudflared tunnel --url http://localhost:6006 > cloudflared.log 2>&1 &
```

#### 4.3 获取公网地址
从cloudflared输出中获取公网地址，格式如：
```
https://xxxxx.trycloudflare.com
```

### 第五步：测试部署结果

#### 5.1 服务器端测试
```bash
# 测试公网地址
curl https://你的公网地址.trycloudflare.com

# 检查服务状态
ps aux | grep -E "(http-server|cloudflared)"
```

#### 5.2 客户端测试
1. 在浏览器中访问公网地址
2. 使用手机访问公网地址
3. 让朋友帮忙测试

### 第六步：保持服务运行

#### 6.1 使用nohup保持运行
```bash
# 前端服务
nohup npx http-server -p 6006 --host 0.0.0.0 > http-server.log 2>&1 &

# cloudflared隧道
nohup /root/autodl-tmp/cloudflared tunnel --url http://localhost:6006 > cloudflared.log 2>&1 &
```

#### 6.2 检查服务状态
```bash
# 查看所有相关进程
ps aux | grep -E "(http-server|cloudflared|npm)"

# 查看日志
tail -f http-server.log
tail -f cloudflared.log
```

## 常见问题解决

### 问题1：端口被占用
```bash
# 查找占用端口的进程
lsof -i :6006

# 杀死进程
kill -9 <进程ID>
```

### 问题2：cloudflared无法生成公网地址
- 检查网络连接
- 重新启动cloudflared
- 尝试不同的端口

### 问题3：公网地址无法访问
- 清除浏览器缓存
- 刷新DNS缓存
- 等待DNS传播
- 尝试不同的网络环境

### 问题4：前端服务不稳定
- 检查端口监听状态
- 查看http-server日志
- 重新启动服务

## 部署成功标志

1. ✅ 前端服务在6006端口正常运行
2. ✅ cloudflared隧道成功建立
3. ✅ 生成有效的公网地址
4. ✅ 服务器端可以访问公网地址
5. ✅ 客户端可以访问公网地址

## 维护建议

1. **定期检查服务状态**
   ```bash
   ps aux | grep -E "(http-server|cloudflared|python3)"
   ```

2. **查看服务日志**
   ```bash
   # 前端服务日志
   tail -f http-server.log
   
   # 前端隧道日志
   tail -f cloudflared.log
   
   # 后端服务日志
   tail -f backend.log
   
   # 后端隧道日志
   tail -f backend-tunnel.log
   ```

3. **重启服务（如需要）**
   ```bash
   # 停止所有服务
   pkill -f http-server
   pkill -f cloudflared
   pkill -f python3
   
   # 重新启动前端
   nohup npx http-server -p 6006 --host 0.0.0.0 > http-server.log 2>&1 &
   nohup /root/autodl-tmp/cloudflared tunnel --url http://localhost:6006 > cloudflared.log 2>&1 &
   
   # 重新启动后端
   nohup python3 app.py > backend.log 2>&1 &
   nohup /root/autodl-tmp/cloudflared tunnel --url http://localhost:3000 > backend-tunnel.log 2>&1 &
   ```

4. **检查服务健康状态**
   ```bash
   # 检查前端
   curl http://localhost:6006
   
   # 检查后端
   curl http://localhost:3000
   
   # 检查前端公网地址
   curl https://前端公网地址
   
   # 检查后端公网地址
   curl https://后端公网地址
   ```

## 注意事项

1. **保持终端连接**：cloudflared需要保持运行，建议使用nohup或screen
2. **公网地址变化**：每次重启cloudflared都会生成新的公网地址
3. **资源监控**：注意服务器资源使用情况
4. **安全考虑**：公网地址是公开的，注意数据安全

## 总结

通过以上步骤，你的MOE专家协作挖掘可视化展示系统已经成功部署到AutoDL公网服务器上，实现了完整的前后端分离架构。部署过程包括：

1. 项目文件上传和依赖安装
2. 前端服务启动和配置
3. 前端cloudflared内网穿透配置
4. 后端服务启动和配置
5. 后端cloudflared内网穿透配置
6. 前后端通信配置
7. 公网访问测试和验证
8. 服务持续运行维护

## 最终部署架构

```
用户设备
    ↓ (HTTPS)
前端公网地址: https://receives-circle-blogging-palestinian.trycloudflare.com
    ↓ (cloudflared隧道)
AutoDL 服务器
    ├── 前端服务 (http-server:6006)
    └── 后端服务 (Flask:3000)
        ↓ (HTTPS)
后端公网地址: https://uv-dictionaries-examples-pci.trycloudflare.com
```

现在你的项目已经可以在公网上正常访问，并且支持完整的前后端分离功能！🎉

## 访问地址

- **前端网站**：https://receives-circle-blogging-palestinian.trycloudflare.com
- **后端API**：https://uv-dictionaries-examples-pci.trycloudflare.com

## 第七步：部署后端服务

### 7.1 启动后端服务
```bash
# 在 AutoDL 服务器上启动后端
cd /root
nohup python3 app.py > backend.log 2>&1 &

# 检查后端服务状态
ps aux | grep python3
curl http://localhost:3000/
```

### 7.2 为后端创建 cloudflared 隧道
```bash
# 为后端创建新的隧道
nohup /root/autodl-tmp/cloudflared tunnel --url http://localhost:3000 > backend-tunnel.log 2>&1 &

# 查看后端隧道日志
tail -f backend-tunnel.log
```

### 7.3 获取后端公网地址
从后端隧道日志中获取公网地址，格式如：
```
https://xxxxx.trycloudflare.com
```

## 第八步：配置前后端通信

### 8.1 修改前端 API 配置
```bash
# 查看当前 API 地址
cat /root/script.js | grep -n "http://"

# 修改 API 地址为后端公网地址
sed -i 's|http://localhost:3000/api/process|https://后端公网地址/api/process|g' /root/script.js
sed -i 's|http://localhost:3000/api/top5-experts|https://后端公网地址/api/top5-experts|g' /root/script.js
sed -i 's|http://localhost:3000/api/top5-second-level-experts|https://后端公网地址/api/top5-second-level-experts|g' /root/script.js

# 验证修改结果
cat /root/script.js | grep -n "https://后端公网地址"
```

### 8.2 重新部署前端
```bash
# 停止前端服务
pkill -f http-server

# 重新启动前端
nohup npx http-server -p 6006 --host 0.0.0.0 > http-server.log 2>&1 &

# 检查服务状态
ps aux | grep http-server
```

## 第九步：测试完整系统

### 9.1 测试后端 API
```bash
# 测试后端根路径
curl https://后端公网地址/

# 测试 API 端点
curl -X POST https://后端公网地址/api/process
```

### 9.2 测试前端访问
访问前端公网地址，确保页面正常加载。

### 9.3 测试前后端通信
在前端页面中：
1. 输入一些文本
2. 点击"确认"按钮
3. 查看是否能正常调用后端 API

## 完整部署架构

```
用户设备
    ↓
前端公网地址 (cloudflared)
    ↓
AutoDL 服务器
    ├── 前端服务 (http-server:6006)
    └── 后端服务 (Flask:3000)
        ↓
后端公网地址 (cloudflared)
```

## 当前部署状态

- **前端服务地址**：http://localhost:6006
- **前端公网地址**：https://receives-circle-blogging-palestinian.trycloudflare.com
- **后端服务地址**：http://localhost:3000
- **后端公网地址**：https://uv-dictionaries-examples-pci.trycloudflare.com
- **部署时间**：2025-09-11
- **状态**：✅ 完整前后端分离部署运行中
