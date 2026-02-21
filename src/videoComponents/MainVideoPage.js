/**
 * 主视频页面组件
 * 支持客户与专业人员两种角色：客户创建 offer，专业人员创建 answer
 */

import { useEffect, useState, useRef } from "react"
import { useSearchParams, useLocation } from "react-router-dom"
import axios from "axios"
import { API_BASE } from "../config"
import "./VideoComponent.css"

import CallInfo from "./CallInfo"
import ChatWindow from "./ChatWindow"
import ActionButtons from "./ActionButton"
import addStream from "../redux-elements/actions/addStream"
import { useDispatch } from "react-redux"
import createPeerConnection from "../webRTCutilities/createPeerConnection"
import socketConnect from "../webRTCutilities/socketConnect"
import socketConnection from "../webRTCutilities/socketConnection"
import updateCallStatus from "../redux-elements/actions/updateCallStatus"
import { useSelector } from "react-redux"

const MainVideoPage = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const [apptInfo, setAppInfo] = useState(location.state?.offerData || {})
  const [searchParams] = useSearchParams()
  const smallFeedEl = useRef(null)
  const largeFeedEl = useRef(null)

  const callStatus = useSelector((state) => state.callStatus)
  const streams = useSelector((state) => state.streams)

  const uuid = searchParams.get("uuid") || apptInfo.uuid
  const token = searchParams.get("token")
  const isPro = !!searchParams.get("uuid")
  const socketRef = useRef(null)
  const [socketReady, setSocketReady] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [remoteDisconnected, setRemoteDisconnected] = useState(false)
  const [mediaError, setMediaError] = useState(null)

  useEffect(() => {
    const s = isPro && token ? socketConnection(token) : socketConnect
    socketRef.current = s
    setSocketReady(true)
    return () => {
      if (isPro && s?.disconnect) s.disconnect()
    }
  }, [isPro, token])

  const socket = socketRef.current

  /** 初始化媒体流和对等连接 */
  useEffect(() => {
    const fetchMedia = async () => {
      const constraints = { video: true, audio: false }
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        dispatch(updateCallStatus("haveMedia", true))
        dispatch(addStream("localStream", stream))

        const emitIce = (candidate) => {
          const s = socketRef.current
          if (uuid && s?.emit) {
            s.emit("iceCandidate", {
              candidate: candidate.toJSON ? candidate.toJSON() : candidate,
              uuid,
              isFromClient: !isPro,
            })
          }
        }

        const { peerConnection, remoteStream } = await createPeerConnection({
          onIceCandidate: emitIce,
        })
        dispatch(addStream("remote1", remoteStream, peerConnection))
      } catch (err) {
        console.error(err)
        setMediaError(err.name === "NotAllowedError" ? "摄像头权限被拒绝" : "获取媒体失败")
      }
    }
    fetchMedia()
  }, [uuid, isPro])

  /** 专业人员：接收 offer，添加本地轨道，创建 answer */
  useEffect(() => {
    if (!isPro || !streams.remote1?.peerConnection || !socketRef.current) return
    if (!streams.localStream?.stream) return
    const offerData = location.state?.offerData
    if (!offerData?.offer) return

    const doAnswer = async () => {
      try {
        const pc = streams.remote1.peerConnection
        streams.localStream.stream.getTracks().forEach((t) =>
          pc.addTrack(t, streams.localStream.stream)
        )
        const offer =
          typeof offerData.offer === "string"
            ? JSON.parse(offerData.offer)
            : offerData.offer
        await pc.setRemoteDescription(
          new RTCSessionDescription(offer)
        )
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        dispatch(updateCallStatus("video", "enabled"))
        socketRef.current.emit("newAnswer", {
          answer: pc.localDescription,
          uuid: offerData.uuid,
        })
      } catch (err) {
        console.error("createAnswer error:", err)
      }
    }
    doAnswer()
  }, [isPro, streams.remote1, streams.localStream, location.state?.offerData, dispatch])

  /** 客户：创建 offer */
  useEffect(() => {
    if (isPro || callStatus.haveCreatedOffer) return
    const hasMedia =
      callStatus.video === "enabled" || callStatus.audio === "enabled"
    if (!hasMedia || !apptInfo.uuid) return

    const doCreateOffer = async () => {
      for (const key of Object.keys(streams)) {
        if (key === "localStream") continue
        const item = streams[key]
        if (!item?.peerConnection) continue
        try {
          const offer = await item.peerConnection.createOffer()
          await item.peerConnection.setLocalDescription(offer)
          socketRef.current?.emit("newOffer", { offer, appInfo: apptInfo })
          dispatch(updateCallStatus("haveCreatedOffer", true))
        } catch (err) {
          console.error("createOffer error:", err)
        }
      }
    }
    doCreateOffer()
  }, [
    isPro,
    callStatus.video,
    callStatus.audio,
    callStatus.haveCreatedOffer,
    streams,
    apptInfo,
    dispatch,
  ])

  /** 监听 newAnswer（客户）和 iceCandidate（双向） */
  useEffect(() => {
    const s = socketRef.current
    if (!s?.on || !streams.remote1?.peerConnection) return

    const onAnswer = async ({ answer }) => {
      try {
        const desc =
          typeof answer === "string" ? JSON.parse(answer) : answer
        await streams.remote1.peerConnection.setRemoteDescription(
          new RTCSessionDescription(desc)
        )
      } catch (err) {
        console.error("setRemoteDescription error:", err)
      }
    }

    const onIce = async ({ candidate }) => {
      try {
        if (candidate) {
          await streams.remote1.peerConnection.addIceCandidate(
            new RTCIceCandidate(candidate)
          )
        }
      } catch (err) {
        console.error("addIceCandidate error:", err)
      }
    }

    const onPeerDisconnected = () => setRemoteDisconnected(true)

    s.on("newAnswer", onAnswer)
    s.on("iceCandidate", onIce)
    s.on("peerDisconnected", onPeerDisconnected)
    return () => {
      s.off("newAnswer", onAnswer)
      s.off("iceCandidate", onIce)
      s.off("peerDisconnected", onPeerDisconnected)
    }
  }, [socketReady, streams.remote1])

  /** 绑定流到 video 元素 */
  useEffect(() => {
    if (streams.localStream?.stream && smallFeedEl.current) {
      smallFeedEl.current.srcObject = streams.localStream.stream
    }
    if (streams.remote1?.stream && largeFeedEl.current) {
      largeFeedEl.current.srcObject = streams.remote1.stream
    }
  }, [streams])

  /** 客户：验证 token 获取预约信息 */
  useEffect(() => {
    if (isPro || !token) return
    const fetchToken = async () => {
      try {
        const res = await axios.post(`${API_BASE}/validate-link`, {
          token,
        })
        setAppInfo(res.data)
      } catch (err) {
        console.error("Token validation failed:", err)
      }
    }
    fetchToken()
  }, [isPro, token])

  return (
    <div className="main-video-page">
      {mediaError && (
        <div className="media-error-banner">{mediaError}</div>
      )}
      {remoteDisconnected && (
        <div className="remote-disconnected-banner">
          对方已断开连接
        </div>
      )}
      <div className="video-chat-wrapper">
        <video
          id="large-feed"
          ref={largeFeedEl}
          autoPlay
          controls
          playsInline
        ></video>
        <video
          id="own-feed"
          ref={smallFeedEl}
          autoPlay
          controls
          playsInline
        ></video>
        {apptInfo.professionFullName ? (
          <CallInfo apptInfo={apptInfo} />
        ) : (
          <></>
        )}
        <ChatWindow
          callUuid={uuid}
          socket={socketRef.current}
          isOpen={chatOpen}
          onToggle={() => setChatOpen((o) => !o)}
        />
      </div>
      <ActionButtons
        smallFeedEl={smallFeedEl}
        openCloseChat={() => setChatOpen((o) => !o)}
      />
    </div>
  )
}

export default MainVideoPage
