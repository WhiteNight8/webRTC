/**
 * 启动本地视频流并添加到所有对等连接
 * 该函数将本地视频轨道添加到所有远程对等连接中，实现视频流的共享
 */

import updateCallStatus from "../../redux-elements/actions/updateCallStatus"

/**
 * 启动本地视频流
 * @param {Object} streams - 包含所有流对象的集合（localStream, remote1, remote2等）
 * @param {Function} dispatch - Redux dispatch 函数，用于更新状态
 */
const startLocalStream = (streams, dispatch) => {
  // 获取本地视频流对象
  const localStream = streams.localStream

  // 遍历所有流对象（包括本地流和远程流）
  for (const s of streams) {
    // 跳过本地流，只处理远程流
    if (s !== "localStream") {
      const curStream = streams[s]

      // 获取本地流的所有视频轨道，并将它们添加到当前远程对等连接中
      // 这样远程端就能接收到本地视频
      localStream.stream.getVideoTracks().forEach((t) => {
        curStream.peerConnection.addTrack(t, streams.localStream.stream)
      })

      // 更新 Redux 状态，标记视频已启用
      dispatch(updateCallStatus("video", "enabled"))
    }
  }
}

export default startLocalStream
