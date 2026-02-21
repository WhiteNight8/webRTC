# Telelegal WebRTC 项目 · 面试文档

面向**求职面试**与**作品集**的项目说明，帮助你在面试中清晰介绍架构、技术实现与业务价值。

---

## 一、项目概览

### 1.1 一句话介绍

**基于 WebRTC 与 Socket.IO 的实时视频通话 Web 应用**，支持客户/专业人员双角色、JWT 预约链接、端到端 P2P 视频、屏幕共享、录制、实时聊天，适用于远程法律咨询等 B2B 场景。

### 1.2 核心竞争力关键词

- 实时音视频 · WebRTC · P2P
- Socket.IO 信令 · SDP/ICE 交换
- React 19 · Redux · 前后端分离
- JWT 鉴权 · HTTPS · 安全性

### 1.3 功能清单

| 模块 | 功能 |
|------|------|
| 视频通话 | 客户创建 offer，专业人员 answer，完整 SDP/ICE 交换 |
| 媒体控制 | 视频开关、音频静音、设备切换 |
| 屏幕共享 | getDisplayMedia + replaceTrack |
| 录制 | MediaRecorder 录制远程流，支持下载 webm |
| 聊天 | Socket.IO 实时文本消息 |
| 专业人员仪表盘 | 等待接听、预约列表、日历、设置 |
| 预约系统 | JWT 链接生成与校验 |

---

## 二、技术架构

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        浏览器 (React SPA)                         │
├─────────────────────────────────────────────────────────────────┤
│  MainVideoPage / ProDashboard                                    │
│  ├── getUserMedia (本地媒体)                                      │
│  ├── RTCPeerConnection (WebRTC P2P)                              │
│  ├── Redux (streams, callStatus)                                 │
│  └── Socket.IO Client (信令)                                     │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS / WSS
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Node 后端 (Express + Socket.IO)                │
│  ├── REST: /user-link, /pro-link, /validate-link (JWT)           │
│  └── Socket: newOffer, newAnswer, iceCandidate, chatMessage      │
└─────────────────────────────────────────────────────────────────┘
                         │
                         ▼
              [ STUN: Google 公共服务器 ]
              [ 可选: TURN 中继 ]
```

### 2.2 技术选型与理由

| 选型 | 理由 |
|------|------|
| **WebRTC** | 浏览器原生、低延迟、P2P 直连，无需插件，适合实时音视频 |
| **Socket.IO** | 封装 WebSocket，自动重连、房间/命名空间易扩展，与 Express 集成方便 |
| **Redux** | 流与通话状态多组件共享，集中管理便于调试和扩展 |
| **JWT** | 无状态、易扩展，预约链接防篡改 |
| **STUN** | NAT 穿透，获取公网地址；生产可加 TURN 提高接通率 |

---

## 三、核心流程（口述版）

### 3.1 客户 → 专业人员 通话建立

1. 客户打开 `/join-video?token=xxx`，获取媒体、创建 RTCPeerConnection
2. 客户点击「Start Video」后，创建 offer，`socket.emit("newOffer", { offer, appInfo })`
3. 后端根据 `professionFullName` 转发给对应专业人员
4. 专业人员 Dashboard 收到 newOffer，显示「等待接听」，点击「加入通话」
5. 专业人员进入 `/join-video-pro`，`setRemoteDescription(offer)`，创建 answer，`emit("newAnswer")`
6. 客户收到 answer，`setRemoteDescription(answer)`
7. 双方交换 ICE 候选，`addIceCandidate`，完成 P2P 连接

### 3.2 信令事件一览

| 事件 | 方向 | 作用 |
|------|------|------|
| newOffer | 客户 → 后端 → 专业人员 | 传递 SDP offer |
| newAnswer | 专业人员 → 后端 → 客户 | 传递 SDP answer |
| iceCandidate | 双向 | 传递 ICE 候选，未连接时缓存 |
| chatMessage | 双向 | 文本聊天 |
| peerDisconnected | 后端 → 对端 | 对方断开通知 |

---

## 四、WebRTC 要点（面试高频）

### 4.1 建立流程

1. **信令**：通过 Socket.IO 交换 SDP offer/answer、ICE 候选  
2. **配置**：双方 `setRemoteDescription`、`addIceCandidate`  
3. **媒体**：`addTrack` 发送轨道，`ontrack` 接收轨道  
4. **P2P**：协商完成后媒体直连，不经过服务器

### 4.2 为什么需要信令？

WebRTC 只管媒体传输和加密，不管「谁和谁通话」。信令负责交换连接所需信息（SDP、ICE）和业务数据（房间号、身份）。

### 4.3 STUN vs TURN

- **STUN**：帮助获取公网地址，多数场景下可建立 P2P  
- **TURN**：P2P 失败时做中继转发，保证连通性，但增加延迟和带宽成本  
- 项目当前用 STUN；生产环境建议配置 TURN 提高穿透率

### 4.4 录制实现

使用 `MediaRecorder` API，将远程流（及可选本地音频）合入 `MediaStream`，按秒切片 `ondataavailable`，`onstop` 时生成 Blob 并触发下载。

---

## 五、项目亮点（简历/自我介绍）

1. **完整 WebRTC 链路**：offer/answer、ICE 交换、ontrack、addIceCandidate 全流程
2. **双角色设计**：客户与专业人员使用不同 Socket 与流程
3. **信令与业务结合**：按 professionFullName 路由，ICE 缓存与重发
4. **屏幕共享**：getDisplayMedia + replaceTrack 无缝切换
5. **录制**：MediaRecorder 本地录制与下载
6. **Error Boundary**：组件级错误隔离，避免整页白屏
7. **前后端分离**：REST + WebSocket，JWT 鉴权，配置化 API 地址

---

## 六、常见面试题与参考答案

**Q1：WebRTC 建立连接的大致步骤？**  

A：通过信令交换 SDP offer/answer；双方配置 `setRemoteDescription`；交换 ICE 候选并 `addIceCandidate`；`addTrack` 发送轨道，`ontrack` 接收；协商完成后媒体走 P2P。

**Q2：ICE 候选是什么？为什么要交换？**  

A：ICE 候选是本端可用的传输地址（IP:端口）。双方需要知道对方的候选才能找到可连通路径，尤其在 NAT 环境下。

**Q3：项目中 Redux 存了什么？**  

A：`streams` 存各 MediaStream 及对应 RTCPeerConnection；`callStatus` 存通话阶段、音视频状态、haveMedia、haveCreatedOffer 等，供控制栏和视频按钮使用。

**Q4：如何保证预约链接安全？**  

A：链接带 JWT token，后端用密钥验证签名；`/validate-link` 只接受合法 token，防止伪造与篡改。

**Q5：为什么必须用 HTTPS？**  

A：`getUserMedia` 等 API 要求安全上下文；WSS 在 HTTPS 下工作，避免信令被中间人篡改。

**Q6：如何扩展为多人会议？**  

A：为每个远端维护独立 RTCPeerConnection；用 Socket 房间管理参与者；客户对每个专业人员创建 offer，或使用 MCU/SFU 架构。

---

## 七、可优化方向（体现思考）

- **TURN 部署**：复杂网络下提升接通率  
- **重连与 ICE 重启**：断线后自动重新协商  
- **单元测试**：对 reducer、工具函数、信令逻辑做测试  
- **TypeScript**：类型约束降低运行时错误  
- **Docker / CI**：便于部署和自动化构建  

---

## 八、简历描述建议

**项目名称**：WebRTC 实时视频通话应用（Telelegal）  

**技术栈**：React 19, Redux, WebRTC, Socket.IO, Express, Node.js, JWT, MediaRecorder  

**描述**：  
基于 WebRTC 实现端到端 P2P 视频通话，完成 SDP offer/answer 与 ICE 候选的完整信令设计；实现屏幕共享、通话录制、实时聊天；搭建专业人员仪表盘（等待接听、日历、设置）；使用 JWT 校验预约链接，前后端分离并支持配置化部署。项目具备扩展为多人会议与 TURN 中继的能力。

---

## 九、面试表述话术

**开场（30 秒）**：  
「这是一个基于 WebRTC 的实时视频通话项目，支持客户通过预约链接发起通话，专业人员从仪表盘接听。我负责端到端实现，包括 WebRTC 信令设计、双角色流程、屏幕共享和录制功能。」

**技术深挖**：  
- 信令：可画 offer → answer → ICE 交换的时序  
- Redux：可说明 streams 与 callStatus 的职责划分  
- 安全：可说明 JWT、HTTPS、WSS 的使用场景  

**收尾**：  
「项目已经跑通完整流程，后续可以考虑加 TURN、多人会议和自动化测试，作为生产级项目打磨。」
