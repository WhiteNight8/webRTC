/**
 * Socket.IO 连接配置
 * 建立与后端的 WebSocket 连接，用于信令传输和实时通信
 * WebRTC 需要信令服务器来交换 SDP offer/answer 和 ICE 候选
 */

import { io } from "socket.io-client"

// 连接到后端 Socket.IO 服务器
// 该连接用于 WebRTC 信令：交换 SDP、ICE 候选等信息
const socket = io.connect("https://localhost:9000")

export default socket
