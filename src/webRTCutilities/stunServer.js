/**
 * WebRTC 对等连接配置
 * 配置 STUN 服务器用于 NAT 穿透，帮助建立 P2P 连接
 * STUN (Session Traversal Utilities for NAT) 服务器用于发现公网 IP 地址和端口
 */

/**
 * ICE 服务器配置
 * STUN：NAT 穿透，获取公网地址
 * TURN：P2P 失败时中继（生产环境可添加）
 */
let peerConfiguration = {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
    },
    // 生产环境示例：添加 TURN 提高复杂网络下接通率
    // { urls: "turn:your-turn-server.com", username: "user", credential: "pass" },
  ],
}

export default peerConfiguration
