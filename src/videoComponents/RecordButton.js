/**
 * 录制按钮
 * 使用 MediaRecorder 录制远程视频流，支持下载
 */
import { useState, useRef, useEffect } from "react"
import { useSelector } from "react-redux"

const RecordButton = () => {
  const streams = useSelector((state) => state.streams)
  const [recording, setRecording] = useState(false)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])

  useEffect(() => () => {
    mediaRecorderRef.current?.stop()
  }, [])

  const toggleRecord = () => {
    if (recording) {
      mediaRecorderRef.current?.stop()
      return
    }

    const remoteStream = streams.remote1?.stream
    const localStream = streams.localStream?.stream
    if (!remoteStream && !localStream) return

    const tracks = []
    if (remoteStream) tracks.push(...remoteStream.getTracks())
    if (localStream && tracks.length === 0) tracks.push(...localStream.getTracks())
    else if (localStream) tracks.push(...localStream.getAudioTracks())
    if (tracks.length === 0) return

    const combined = new MediaStream(tracks)
    const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm"
    const mr = new MediaRecorder(combined, { mimeType: mime })
    chunksRef.current = []

    mr.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mime })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `telelegal-${Date.now()}.webm`
      a.click()
      URL.revokeObjectURL(url)
      setRecording(false)
    }

    mediaRecorderRef.current = mr
    mr.start(1000)
    setRecording(true)
  }

  return (
    <div className="button-no-caret d-inline-block">
      <div
        className={`button participants ${recording ? "recording" : ""}`}
        onClick={toggleRecord}
      >
        <i className="fa fa-circle"></i>
        <div className="btn-text">{recording ? "停止录制" : "录制"}</div>
      </div>
    </div>
  )
}

export default RecordButton
