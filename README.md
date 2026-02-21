# Telelegal 前端

基于 React 19 + Redux + WebRTC 的视频通话客户端，支持客户预约链接与专业人员仪表盘。

## 功能

- **首页** `/`：欢迎页
- **客户视频页** `/join-video?token=xxx`：客户通过预约链接进入视频通话
- **专业人员仪表盘** `/dashboard?token=xxx`：查看预约列表，点击 Join 加入通话
- **专业人员视频页** `/join-video-pro?token=xxx&uuid=...`：专业人员加入后的视频界面
- **屏幕共享**：共享屏幕（getDisplayMedia）
- **聊天**：实时文本消息
- **挂断**：关闭连接、停止流、返回首页

## 配置

复制 `.env.example` 为 `.env`，可设置 `REACT_APP_API_BASE` 覆盖后端地址。

## 技术栈

- React 19、Redux 5、react-router-dom 7
- Socket.IO Client（信令）
- WebRTC（getUserMedia、RTCPeerConnection）
- Axios、moment.js

## 安装与运行

```bash
npm install
npm start
```

需配置 HTTPS 证书（见 package.json 的 start 脚本）。前端地址：`https://localhost:3000`。

## 项目结构

```
src/
├── App.js                 # 根组件、路由配置
├── index.js               # 入口、Redux Provider
├── redux-elements/        # Redux 状态（callStatus、streams）
├── webRTCutilities/       # createPeerConnection、socketConnect、socketConnection、proSocketListeners
├── videoComponents/       # MainVideoPage、CallInfo、ChatWindow、ActionButtons 等
└── siteComponents/        # ProDashboard
```
