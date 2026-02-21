# Telelegal 后端

基于 Node.js + Express 5 + Socket.IO 的 HTTPS 服务，提供 API 与 WebRTC 信令。

## 功能

- **API 路由**（expressRouter.js）
  - `GET /user-link`：生成客户视频链接
  - `POST /validate-link`：验证 JWT token，返回预约信息
  - `GET /pro-link`：生成专业人员仪表盘链接

- **Socket.IO 信令**（socketServer.js）
  - 客户端 `newOffer` → 转发给对应专业人员
  - 支持 `professionFullName` 身份路由

## 环境要求

- Node.js 18+
- 证书文件：`certs/create-cert.pem`、`certs/create-cert-key.pem`

## 安装与运行

```bash
npm install
node index.js
# 或开发模式
npm run dev
```

服务地址：`https://localhost:9000`

## 项目结构

```
telelegaL-back-end/
├── index.js          # 入口，加载 server / socketServer / expressRouter
├── server.js         # HTTPS + Express + Socket.IO 创建
├── expressRouter.js  # API 路由
├── socketServer.js   # Socket.IO 信令逻辑
├── certs/            # HTTPS 证书（需自行生成）
└── package.json
```

## 环境变量

| 变量 | 说明 |
|------|------|
| `LINK_SECRET` | JWT 签名密钥（默认：whitenight118） |
