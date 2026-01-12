/**
 * 创建 WebRTC 对等连接
 * 初始化 RTCPeerConnection 对象，配置信令状态和 ICE 候选事件监听器
 */

import peerConfiguration from "./stunServer"

/**
 * 创建并配置 WebRTC 对等连接
 * @returns {Promise<Object>} 返回包含 peerConnection 和 remoteStream 的对象
 * @returns {RTCPeerConnection} peerConnection - WebRTC 对等连接对象
 * @returns {MediaStream} remoteStream - 用于接收远程媒体流的 MediaStream 对象
 */
const createPeerConnection = () => {
  return new Promise(async (resolve, reject) => {
    // 使用 STUN 服务器配置创建 RTCPeerConnection 实例
    // STUN 服务器用于 NAT 穿透，帮助建立 P2P 连接
    const peerConnection = await new RTCPeerConnection(peerConfiguration)

    // 创建用于接收远程媒体流的 MediaStream 对象
    const remoteStrem = new MediaStream()

    /**
     * 监听信令状态变化事件
     * 信令状态包括：stable, have-local-offer, have-remote-offer, have-local-pranswer, have-remote-pranswer, closed
     */
    peerConnection.addEventListener("signalingstatechange", (e) => {
      console.log("signaling state change")
      console.log(e)
    })
    
    /**
     * 监听 ICE 候选事件
     * ICE (Interactive Connectivity Establishment) 候选用于建立网络连接
     * 当发现新的 ICE 候选时触发此事件
     */
    peerConnection.addEventListener("icecandidate", (e) => {
      console.log("found ice candidate")
      // 如果存在候选，可以在这里发送给远程端
      if (e.candidate) {
        // TODO: 将 ICE 候选发送给远程对等端
      }
    })
    
    // 返回创建的对等连接和远程流
    resolve({
      peerConnection,
      remoteStrem,
    })
  })
}

export default createPeerConnection
