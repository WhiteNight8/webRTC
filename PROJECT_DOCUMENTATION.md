# WebRTC 项目详细文档（面试与求职向）

本文档面向**面试准备**与**求职材料**，帮助你清晰介绍项目架构、技术选型与实现细节，并回答常见技术问题。

---

## 一、项目定位与业务场景

- **项目名称**：WebRTC 视频通话应用（Telelegal 前端/全栈）
- **一句话介绍**：基于 WebRTC 与 Socket.IO 的实时视频通话 Web 应用，支持 JWT 预约链接校验、本地/远程视频流管理、音视频控制与聊天 UI，适用于远程法律咨询等场景。
- **可强调的能力**：实时音视频、P2P 连接、信令设计、React 状态管理、前后端分离、HTTPS 与安全实践。

---

## 二、技术架构总览

### 2.1 整体架构图（口述时可画）

```
[ 浏览器 ]  <--HTTPS/WSS-->  [ Node 后端 :9000 ]
    |                              |
    |  getUserMedia / RTCPeerConnection (WebRTC)
    |  Redux (streams, callStatus)
    v
[ 本地/远程视频 UI、控制栏、聊天、预约信息 ]
```

- **前端**：React 单页应用，Redux 管理“流”与“通话状态”，WebRTC 负责采集与 P2P 传输。
- **后端**：Express 提供 REST（如 `/validate-link`）与静态资源；Socket.IO 提供 WebSocket，用于 WebRTC 信令（SDP/ICE）。
- **安全**：全站 HTTPS；预约链接使用 JWT 签名与验证，防止篡改。

### 2.2 技术选型理由（面试可答）

| 选型 | 原因 |
|------|------|
| **WebRTC** | 浏览器原生、低延迟、支持 P2P，适合实时音视频，无需插件。 |
| **Socket.IO** | 封装 WebSocket，自动重连、房间/命名空间方便扩展，与 Express 集成简单。 |
| **Redux** | 通话状态（当前状态、音视频开关、是否有媒体）和流对象（localStream、remote1…）多处组件共享，集中管理便于调试和扩展。 |
| **STUN（Google）** | 帮助在 NAT 后获取公网地址，多数场景下仅 STUN 即可建立连接；若需高穿透率可后续加 TURN。 |
| **JWT** | 无状态、易扩展；预约链接带 token，后端验证即可识别会话与权限。 |

---

## 三、核心模块与数据流

### 3.1 前端核心模块

| 模块 | 路径/文件 | 职责 |
|------|-----------|------|
| 入口与状态 | `index.js` | 创建 Redux store（rootReducer），Provider 包裹 App。 |
| 路由 | `App.js` | `/` 首页，`/join-video` 视频页（MainVideoPage）。 |
| 视频页 | `MainVideoPage.js` | 挂载时 getUserMedia、createPeerConnection、addStream；请求 `/validate-link` 拿预约信息；渲染大小窗口、CallInfo、ChatWindow、ActionButtons。 |
| 对等连接 | `createPeerConnection.js` | 使用 STUN 配置创建 RTCPeerConnection，监听 signalingstatechange、icecandidate，返回 peerConnection + remoteStream。 |
| 本地流共享 | `startLocalStream.js` | 将本地流的视频轨道通过 `addTrack` 加到各个远程 peerConnection 上。 |
| 本地音频共享 | `startAudioStream.js` | 将本地流的音频轨道通过 `addTrack` 加到各个远程 peerConnection 上；用于首次点击「Join Audio」。 |
| 信令连接 | `socketConnect.js` | Socket.IO 客户端连接 `https://localhost:9000`，供后续 SDP/ICE 交换使用。 |
| STUN 配置 | `stunServer.js` | 提供 `iceServers`（如 stun.l.google.com:19302）。 |
| 流状态 | `streamsReducer.js` | 存储 `localStream`、`remote1`… 及对应 MediaStream、RTCPeerConnection。 |
| 通话状态 | `callStatusReducer.js` | current、video、audio、haveMedia、shareScreen 等。 |
| 操作栏 | `ActionButton.js` | 整合音频、视频、参与者、聊天、屏幕共享、挂断；鼠标移动显示/4 秒无操作隐藏。 |
| 音频按钮 | `AudioButton.js` | Join Audio / Mute / Unmute；设备切换（麦克风、扬声器）；调用 startAudioStream、changeAudioDevice。 |

### 3.2 后端核心模块

| 模块 | 文件 | 职责 |
|------|------|------|
| 服务与 Socket | `server.js` | HTTPS（证书）、Express、CORS、静态资源；Socket.IO 挂载在同一端口，监听 9000。 |
| 路由与 JWT | `expressRouter.js` | `GET /user-link` 生成带 JWT 的 join-video 链接；`POST /validate-link` 校验 token 并返回预约数据。 |

### 3.3 关键数据流（便于口述）

1. **进入视频页**  
   - 用户打开 `/join-video?token=xxx`。  
   - MainVideoPage 的 useEffect：`getUserMedia({ video: true, audio: false })` → `addStream('localStream', stream)`；`createPeerConnection()` → `addStream('remote1', remoteStream, peerConnection)`；并请求 `POST /validate-link` 得到预约信息。

2. **视频开/关**  
   - 用户点“Start/Stop Video”。  
   - VideoButton 从 Redux 取 streams、callStatus；若有 haveMedia 和 localStream，则把 `streams.localStream.stream` 设到 smallFeedEl，并调用 `startLocalStream(streams, dispatch)` 把本地视频轨道 addTrack 到各 remote 的 peerConnection，同时 dispatch `updateCallStatus('video', 'enabled')`。

3. **音频加入/静音**  
   - 用户点「Join Audio」。  
   - AudioButton 调用 `changeAudioDevice({ target: { value: "input-default" } })` 获取默认麦克风流，`addStream('localStream', stream)` 写入 Redux，再调用 `startAudioStream(streams, dispatch)` 把本地音频轨道 addTrack 到各 remote 的 peerConnection，dispatch `updateCallStatus('audio', 'enabled')`。  
   - 静音：将音频轨道的 `enabled` 设为 false；取消静音：设回 true，并 dispatch 更新状态。

4. **挂断**  
   - HangupButton 里 dispatch `updateCallStatus('current', 'complete')`，通话状态变为完成，按钮根据 callStatus.current 隐藏。

---

## 四、WebRTC 与信令（面试高频）

### 4.1 WebRTC 在本项目中的使用

- **getUserMedia**：获取本地摄像头（及可选的麦克风）MediaStream。  
- **RTCPeerConnection**：创建对等连接，配置 STUN；`addTrack` 发送本地轨道；`ontrack`（若已接）接收远端轨道到 MediaStream。  
- **SDP / ICE**：标准流程是 A 创建 offer → B 收 offer 并 create answer → 双方交换 ICE candidate；本项目已搭好 Socket 与 RTCPeerConnection，ICE 在 createPeerConnection 中打印，发送到对端为 TODO，可说明“信令通道已就绪，完整一对一需实现 offer/answer 与 ICE 的收发”。

### 4.2 信令的作用

- 交换 **SDP（offer/answer）**：描述媒体能力与编码方式。  
- 交换 **ICE 候选**：描述本端可用的传输地址，便于在 NAT 下建立最佳路径。  
- 本项目使用 **Socket.IO** 作为信令通道，与业务 API 共用同一 HTTPS 后端，便于部署与鉴权。

### 4.3 STUN / TURN 简述

- **STUN**：帮助终端发现自己在 NAT 后的公网 IP:端口，多数家庭/办公网络下足够建立 P2P。  
- **TURN**：当 P2P 无法建立时，通过中继服务器转发媒体流，保证连通性但增加延迟与带宽成本。  
- 本项目仅配置 STUN（Google 公共服务器），可说明“生产环境可增加 TURN 以提升穿透率”。

---

## 五、Redux 设计（面试可讲）

- **streams**（streamsReducer）：  
  - 以 `who` 为 key（如 `localStream`、`remote1`），存 `{ stream, peerConnection? }`。  
  - 便于多处组件共享同一流与连接，并支持多路远程流扩展。

- **callStatus**（callStatusReducer）：  
  - 集中管理 current（idle/negotiating/progress/complete）、video/audio 状态、haveMedia、设备选择等。  
  - 控制栏、挂断、视频按钮等只读 callStatus 或 dispatch updateCallStatus，逻辑清晰。

- **可扩展点**：  
  - 可加 middleware 做日志或持久化；可拆分为 slice（Redux Toolkit）以简化样板代码。

---

## 六、常见面试问题与参考答案

**Q1：WebRTC 的建立流程是怎样的？**  
A：先通过信令服务器（本项目用 Socket.IO）交换 SDP offer/answer 和 ICE 候选；双方用这些信息配置 RTCPeerConnection，完成 NAT 穿透和媒体协商；之后媒体流直接 P2P 传输，不经过服务器。

**Q2：为什么需要信令？WebRTC 不能自己发现对方吗？**  
A：WebRTC 只负责媒体传输和加密，不负责“谁和谁通话”。信令用来交换连接所需的信息（SDP、ICE）以及业务逻辑（如房间号、身份），因此需要额外通道（如 WebSocket/Socket.IO）。

**Q3：STUN 和 TURN 的区别？**  
A：STUN 帮助获取公网地址，用于 P2P 建立；TURN 在 P2P 失败时作为中继转发媒体，保证连通性但占用服务器带宽。

**Q4：项目中 Redux 存了哪些状态？**  
A：主要有两块：streams 存各路媒体流及对应的 RTCPeerConnection；callStatus 存当前通话阶段、音视频开关、是否已获取媒体等，供控制栏和挂断等组件使用。

**Q5：如何保证预约链接安全？**  
A：链接中带 JWT token，后端用密钥验证签名并解析出预约信息；未经验证的 token 无法通过 `/validate-link`，防止伪造或篡改。

**Q6：前后端为什么用 HTTPS？**  
A：getUserMedia 等 API 在生产环境通常要求安全上下文；WebSocket（Socket.IO）在 HTTPS 下为 WSS，避免被中间人篡改信令。

---

## 七、项目亮点（简历/自我介绍可用）

- 使用 **WebRTC** 实现浏览器端实时音视频采集与 P2P 传输，理解 SDP、ICE 与信令流程。  
- 使用 **Socket.IO** 搭建信令通道，与 Express 后端集成，为多端协商与扩展留好接口。  
- 使用 **Redux** 统一管理媒体流与通话状态，组件职责清晰，便于维护和扩展。  
- 使用 **JWT** 实现预约链接的生成与校验，前后端分离，具备基本安全意识。  
- **React 19**、**React Router 7**、**Redux 5** 等较新栈，体现学习与工程实践能力。  
- 具备**全栈视角**：前端 React + 状态管理 + WebRTC，后端 Express + Socket.IO + HTTPS + JWT。

---

## 八、可优化与扩展（体现思考）

- **信令完善**：在 Socket 上实现 offer/answer 与 ICE 候选的收发，完成端到端一对一通话。  
- **多人与房间**：用 Socket 房间或 namespace 管理多人，为每个远端创建独立 RTCPeerConnection 并维护在 streams 中。  
- **TURN**：在复杂网络下配置 TURN 服务器，提高接通率。  
- **错误与重连**：对 getUserMedia、RTCPeerConnection 失败做提示与重试；Socket 断线重连后重新协商。  
- **预约字段统一**：后端返回字段与前端 CallInfo 命名一致（或做一层映射），避免展示异常。  
- **TypeScript / 单元测试**：对关键工具函数与 reducer 加测试；用 TS 约束流与状态结构，减少运行时错误。

---

## 九、简历/作品集描述建议

**项目名称**：WebRTC 实时视频通话应用（Telelegal）

**技术栈**：React, Redux, WebRTC, Socket.IO, Express, Node.js, JWT, HTTPS

**描述示例**：  
负责前端设计与实现，基于 WebRTC 实现实时音视频采集与 P2P 传输，使用 Socket.IO 完成信令通道搭建，Redux 管理媒体流与通话状态；参与后端接口设计，使用 JWT 校验预约链接并返回预约信息。项目采用前后端分离与 HTTPS 部署，具备扩展为多人会议与 TURN 中继的能力。

---

以上内容可直接用于准备面试问答、简历撰写和作品集说明；可根据实际面试岗位（前端偏多 / 全栈 / 音视频方向）适当裁剪或展开对应章节。
