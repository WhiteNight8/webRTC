/**
 * Redux Reducer: 流管理
 * 管理所有媒体流对象的状态
 * 
 * 流对象结构：
 * {
 *   who: string,              // 流的标识符（"localStream", "remote1", "remote2" 等）
 *   stream: MediaStream,       // 媒体流对象，包含视频/音频轨道，可在 <video /> 中播放
 *   peerConnection: RTCPeerConnection  // WebRTC 对等连接对象（远程流必需）
 * }
 * 
 * 流标识符说明：
 * - localStream: 本地视频流
 * - remote1, remote2+: 远程视频流（可以有多个）
 */

export default (state = {}, action) => {
  // 添加新的流对象
  if (action.type === "ADD_STREAM") {
    const copyState = { ...state }
    // 使用流的标识符作为 key，存储完整的流对象
    copyState[action.payload.who] = action.payload
    return copyState
  } 
  else if (action.type === "LOGOUT_ACTION" || action.type === "END_CALL") {
    return {}
  } 
  // 其他 action 不改变状态
  else {
    return state
  }
}
