/**
 * Redux Action: 添加流
 * 用于将媒体流和对等连接添加到 Redux store
 * 
 * @param {string} who - 流的标识符（如 "localStream", "remote1", "remote2" 等）
 * @param {MediaStream} stream - 媒体流对象（包含视频/音频轨道）
 * @param {RTCPeerConnection} peerConnection - WebRTC 对等连接对象（可选，远程流需要）
 * @returns {Object} Redux action 对象
 */
export default (who, stream, peerConnection) => {
  return {
    type: "ADD_STREAM",
    payload: {
      who,              // 流的标识符
      stream,           // 媒体流对象
      peerConnection,   // 对等连接对象（远程流必需）
    },
  }
}
