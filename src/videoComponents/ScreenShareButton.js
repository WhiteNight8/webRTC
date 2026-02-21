/**
 * 屏幕共享按钮
 * 使用 getDisplayMedia 获取屏幕流，替换 peerConnection 中的视频轨道
 */

import { useState, useRef } from "react"
import { useSelector } from "react-redux"

const ScreenShareButton = ({ smallFeedEl }) => {
  const streams = useSelector((state) => state.streams)
  const [sharing, setSharing] = useState(false)
  const screenStreamRef = useRef(null)

  const toggleScreenShare = async () => {
    if (sharing) {
      screenStreamRef.current?.getTracks().forEach((t) => t.stop())
      screenStreamRef.current = null
      const localStream = streams.localStream?.stream
      if (localStream) {
        const [camTrack] = localStream.getVideoTracks()
        Object.entries(streams).forEach(([key, val]) => {
          if (key !== "localStream" && val?.peerConnection && camTrack) {
            const sender = val.peerConnection
              .getSenders()
              .find((s) => s.track?.kind === "video")
            if (sender) sender.replaceTrack(camTrack)
          }
        })
      }
      if (localStream && smallFeedEl?.current) {
        smallFeedEl.current.srcObject = localStream
      }
      setSharing(false)
      return
    }

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      })
      screenStreamRef.current = screenStream
      const [screenTrack] = screenStream.getVideoTracks()
      if (!screenTrack) return

      Object.entries(streams).forEach(([key, val]) => {
        if (key !== "localStream" && val?.peerConnection) {
          const sender = val.peerConnection
            .getSenders()
            .find((s) => s.track?.kind === "video")
          if (sender) sender.replaceTrack(screenTrack)
        }
      })

      if (smallFeedEl?.current) {
        smallFeedEl.current.srcObject = screenStream
      }
      setSharing(true)

      screenTrack.onended = () => {
        screenStreamRef.current?.getTracks().forEach((t) => t.stop())
        setSharing(false)
      }
    } catch (err) {
      console.error("Screen share error:", err)
    }
  }

  return (
    <div
      className={`button-no-caret participants d-inline-block ${sharing ? "active" : ""}`}
    >
      <div className="button participants" onClick={toggleScreenShare}>
        <i className="fa fa-desktop"></i>
        <div className="btn-text">
          {sharing ? "停止共享" : "共享屏幕"}
        </div>
      </div>
    </div>
  )
}

export default ScreenShareButton
