import updateCallStatus from "../../redux-elements/actions/updateCallStatus"

/**
 * 将本地音频轨道 addTrack 到各远程 peerConnection，并更新通话状态
 * 用于用户首次点击「Join Audio」时，把本地麦克风流共享给已建立的远程连接
 *
 * @param {Object} streams - Redux streams 状态，含 localStream 及各 remote（remote1、remote2…）
 * @param {Function} dispatch - Redux dispatch
 */
const startAudioStream = (streams, dispatch) => {
  const localStream = streams.localStream
  // 遍历所有远程流，把本地音频轨道 addTrack 到各自的 peerConnection
  for (const s of Object.keys(streams)) {
    if (s !== "localStream") {
      const curStream = streams[s]
      localStream.stream.getAudioTracks().forEach((t) => {
        curStream.peerConnection.addTrack(t, localStream.stream)
      })
    }
  }
  dispatch(updateCallStatus("audio", "enabled"))
}

export default startAudioStream
