# WebRTC 视频通话应用 (Telelegal)

基于 WebRTC 的实时视频通话前端项目，支持预约链接验证、本地/远程视频流、音视频控制与聊天界面。适用于法律咨询等远程会话场景（Telelegal）。

---

## 项目概述

- **类型**：前后端分离的 Web 实时音视频应用
- **前端**：React 19 + Redux 5 + React Router 7
- **后端**：Node.js + Express 5 + Socket.IO + HTTPS
- **核心能力**：WebRTC P2P 连接、信令（Socket.IO）、媒体流管理、JWT 预约链接

---

## 技术栈

| 层级 | 技术 | 用途 |
|------|------|------|
| 前端框架 | React 19 | UI 与组件化 |
| 状态管理 | Redux 5 + react-redux 9 | 通话状态、媒体流全局状态 |
| 路由 | react-router-dom 7 | 首页 / 视频页路由 |
| 实时通信 | Socket.IO Client 4.8 | 信令（SDP/ICE 交换） |
| 音视频 | WebRTC (getUserMedia, RTCPeerConnection) | 采集、编码、P2P 传输 |
| HTTP 请求 | Axios | 预约链接校验等 API |
| 时间处理 | moment.js | 预约时间相对显示 |
| 后端 | Express 5, Socket.IO, jsonwebtoken, cors | HTTPS 服务、信令、JWT 验证 |

---

## 项目结构

```
webRTC/
├── telelegal-front-end/          # React 前端
│   ├── src/
│   │   ├── App.js                # 路由：/、/join-video
│   │   ├── index.js              # 入口、Redux Provider、rootReducer
│   │   ├── redux-elements/
│   │   │   ├── reducers/         # callStatus、streams、rootReducer
│   │   │   └── actions/          # addStream、updateCallStatus
│   │   ├── webRTCutilities/      # createPeerConnection、stunServer、socketConnect
│   │   └── videoComponents/      # MainVideoPage、CallInfo、ChatWindow、ActionButton、AudioButton、VideoButton、startAudioStream 等
│   └── package.json
├── telelegaL-back-end/           # Node 后端（信令 + API）
│   ├── server.js                 # HTTPS + Express + Socket.IO
│   ├── expressRouter.js          # /user-link、/validate-link（JWT）
│   └── package.json
└── README.md
```

---

## 快速开始

### 环境要求

- Node.js（建议 18+）
- 浏览器支持：Chrome / Firefox / Safari（需支持 WebRTC、getUserMedia、HTTPS）

### 后端

```bash
cd telelegaL-back-end
npm install
# 确保项目根目录或 certs 目录下有 create-cert-key.pem、create-cert.pem（HTTPS）
node server.js
# 或使用 nodemon 开发
```

服务默认：`https://localhost:9000`。

### 前端

```bash
cd telelegal-front-end
npm install
# 需配置 HTTPS 与证书（见 package.json start 脚本）
npm start
```

前端默认：`https://localhost:3000`。  
视频页地址：`https://localhost:3000/join-video?token=<JWT>`。

### 获取带 token 的链接

访问后端：`GET https://localhost:9000/user-link`，返回带 `token` 的完整 `/join-video` 链接，用该链接进入视频页。

---

## 核心流程

1. **进入视频页**：访问 `/join-video?token=xxx`。
2. **媒体与连接**：页面请求摄像头（getUserMedia），创建 `RTCPeerConnection`（STUN：Google），将本地流与远程流写入 Redux。
3. **预约校验**：前端把 `token` 发给 `POST /validate-link`，后端 JWT 验证后返回预约信息（专业人员、时间等），用于 CallInfo 展示。
4. **信令**：通过 Socket.IO 连接 `https://localhost:9000`，用于后续交换 SDP offer/answer 与 ICE 候选（当前代码中 ICE 发送为 TODO）。
5. **控制**：视频开/关、音频加入/静音、挂断等通过 Redux 与 `startLocalStream`、`startAudioStream` 等逻辑更新状态与轨道。

---

## 主要模块说明

- **MainVideoPage**：挂载时拉流、建连、校验 token；渲染大小窗口（远程/本地）、CallInfo、ChatWindow、ActionButtons。
- **createPeerConnection**：封装 `RTCPeerConnection`、STUN 配置、`signalingstatechange` / `icecandidate` 监听。
- **startLocalStream**：把本地视频轨道加到各远程对等连接的 `peerConnection` 上。
- **startAudioStream**：把本地音频轨道 addTrack 到各远程 peerConnection，用于首次加入音频。
- **AudioButton**：音频加入/静音/取消静音；设备切换（麦克风、扬声器）；与 VideoButton 类似，通过 Redux 更新 callStatus 与 streams。
- **Redux**：`streams` 存 localStream/remote1… 及对应 `peerConnection`；`callStatus` 存 current、video、audio、haveMedia 等。

---

## 注意事项

- 前后端均使用 HTTPS；本地开发需自签名证书（如 `certs/create-cert.pem`、`create-cert-key.pem`）。
- 后端返回的预约字段为 `professionFullName`、`appDate`；前端 CallInfo 使用 `professionalsFullName`、`apptDate`，若展示异常需统一字段名或做一层映射。
- 当前 ICE 候选仅打印，未通过 Socket 发送给对端，完整一对一通话需实现信令交换（offer/answer + ICE）。

---

## 文档与面试

更详细的**架构说明、面试常见问题、项目亮点与表述建议**见：[PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)（面向面试与求职）。
