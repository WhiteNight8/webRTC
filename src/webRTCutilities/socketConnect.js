/**
 * Socket.IO 连接配置
 * 建立与后端的 WebSocket 连接，用于信令传输和实时通信
 * WebRTC 需要信令服务器来交换 SDP offer/answer 和 ICE 候选
 */

import { io } from "socket.io-client"
import { API_BASE } from "../config"

const socket = io(API_BASE)

export default socket
