项目启动说明

前提条件
- 已安装 Node.js 与 npm
- 已安装 Python（Windows 推荐使用 py 启动器）

安装依赖
1) 前端依赖（用于本地静态服务器）
```
npm install
```
2) 后端依赖（Flask）
```
py -m pip install -r requirements.txt
```

启动
在两个独立终端分别执行：

终端 1（后端 Flask，端口 3000）
```
npm run start:backend
```

终端 2（前端静态站点，端口 5173）
```
npm run start:frontend
```

访问
- 打开浏览器访问: http://localhost:5173
- 前端会调用后端: http://localhost:3000

远程服务器连接（可选）
如果需要使用实验室的DeepSeek MOE模型，需要建立SSH隧道：

终端 3（SSH隧道，端口转发）
```
ssh -o ServerAliveInterval=60 -o ServerAliveCountMax=3 -NT -L 9000:127.0.0.1:8014 tingyucao@10.103.69.253
```

然后设置环境变量启用远程调用：
```
set USE_REMOTE=true
set REMOTE_BASE=http://localhost:9000
```

重新启动后端即可使用远程模型。

常见问题
- 如果浏览器控制台提示 axios 未定义：确保前端已成功加载 `node_modules/axios/dist/axios.min.js`。
- 如果 3000 端口被占用：先停止占用该端口的进程，或修改 `app.py` 的端口并同步更新前端请求地址。
- 如果远程调用失败：检查SSH隧道是否建立成功，或设置 `USE_REMOTE=false` 使用本地模式。

停止
- 在对应终端使用 Ctrl + C 停止。
