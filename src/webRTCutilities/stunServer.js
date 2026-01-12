/**
 * WebRTC 对等连接配置
 * 配置 STUN 服务器用于 NAT 穿透，帮助建立 P2P 连接
 * STUN (Session Traversal Utilities for NAT) 服务器用于发现公网 IP 地址和端口
 */

let peerConfiguration = {
  iceServers: [
    {
      // Google 公共 STUN 服务器
      // 用于帮助客户端发现其在 NAT 后的公网地址
      urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
    },
  ],
}

export default peerConfiguration
