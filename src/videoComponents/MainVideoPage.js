import { useEffect, useState, useRef } from "react"
import { useSearchParams } from "react-router-dom"
import axios from "axios"
import "./VideoComponent.css"

import CallInfo from "./CallInfo"
import ChatWindow from "./ChatWindow"
import ActionButtons from "./ActionButton"
import addStream from "../redux-elements/actions/addStream"
import { useDispatch } from "react-redux"
import createPeerConnection from "../webRTCutilities/createPeerConnection"
import socket from "../webRTCutilities/socketConnect"
import updateCallStatus from "../redux-elements/actions/updateCallStatus"

const MainVideoPage = () => {
  const dispatch = useDispatch()
  const [apptInfo, setAppInfo] = useState({})
  const [searchParams, setSearchParams] = useSearchParams()
  const smallFeedEl = useRef(null)
  const largeFeedEl = useRef(null)

  useEffect(() => {
    const fetchMedia = async () => {
      const constraints = {
        video: true,
        audio: false,
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        dispatch(updateCallStatus("haveMedia", true))

        dispatch(addStream("localStrem", stream))

        const { peerConnection, remoteStream } = await createPeerConnection()
        dispatch(addStream("remote1", remoteStream, peerConnection))
      } catch (err) {
        console.log(err)
      }
    }
    fetchMedia()
  }, [])

  useEffect(() => {
    const token = searchParams.get("token")
    const fetchDecodedToken = async () => {
      const res = await axios.post("https://localhost:9000/validate-link", {
        token,
      })
      setAppInfo(res.data)
    }
    fetchDecodedToken()
  }, [searchParams])

  return (
    <div className="main-video-page">
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
        {apptInfo.professionalsFullName ? (
          <CallInfo apptInfo={apptInfo} />
        ) : (
          <></>
        )}
        <ChatWindow />
      </div>
      <ActionButtons />
    </div>
  )
}

export default MainVideoPage
