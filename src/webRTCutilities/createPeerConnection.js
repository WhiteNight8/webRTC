/**
 * 创建 WebRTC 对等连接
 * 初始化 RTCPeerConnection 对象，配置信令状态和 ICE 候选事件监听器
 */

import peerConfiguration from "./stunServer"

/**
 * 创建并配置 WebRTC 对等连接
 * @param {Object} options - 配置项
 * @param {Function} options.onIceCandidate - 发现 ICE 候选时的回调 (candidate) => void
 * @returns {Promise<Object>} 返回包含 peerConnection 和 remoteStream 的对象
 */
const createPeerConnection = (options = {}) => {
  const { onIceCandidate } = options
  return new Promise(async (resolve, reject) => {
    // 使用 STUN 服务器配置创建 RTCPeerConnection 实例
    // STUN 服务器用于 NAT 穿透，帮助建立 P2P 连接
    const peerConnection = await new RTCPeerConnection(peerConfiguration)

    // 创建用于接收远程媒体流的 MediaStream 对象
    const remoteStream = new MediaStream()

    /**
     * 监听信令状态变化事件
     * 信令状态包括：stable, have-local-offer, have-remote-offer, have-local-pranswer, have-remote-pranswer, closed
     */
    peerConnection.addEventListener("signalingstatechange", (e) => {
      console.log("signaling state change")
      console.log(e)
    })
    
    /**
     * 监听远程轨道事件
     * 当对方 addTrack 后，收到 ontrack，将轨道加入 remoteStream 供 video 元素显示
     */
    peerConnection.addEventListener("ontrack", (e) => {
      if (e.streams?.[0]) {
        e.streams[0].getTracks().forEach((t) => remoteStream.addTrack(t))
      } else if (e.track) {
        remoteStream.addTrack(e.track)
      }
    })

    /**
     * 监听 ICE 候选事件，通过回调发给信令服务器
     */
    peerConnection.addEventListener("icecandidate", (e) => {
      if (e.candidate && onIceCandidate) {
        onIceCandidate(e.candidate)
      }
    })
    
    // 返回创建的对等连接和远程流
    resolve({
      peerConnection,
      remoteStream,
    })
  })
}

export default createPeerConnection
