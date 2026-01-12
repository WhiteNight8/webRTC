/**
 * 主视频页面组件
 * 这是视频通话的主界面，负责初始化媒体流、创建对等连接、显示视频和聊天窗口
 */

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
  // 存储预约信息（从 token 解析得到）
  const [apptInfo, setAppInfo] = useState({})
  // 获取 URL 查询参数
  const [searchParams, setSearchParams] = useSearchParams()
  // 小窗口视频元素引用（本地预览）
  const smallFeedEl = useRef(null)
  // 大窗口视频元素引用（远程视频）
  const largeFeedEl = useRef(null)

  /**
   * 初始化媒体流和对等连接
   * 组件挂载时自动执行，获取用户摄像头权限并创建 WebRTC 连接
   */
  useEffect(() => {
    const fetchMedia = async () => {
      // 配置媒体约束：仅请求视频，不请求音频
      const constraints = {
        video: true,
        audio: false,
      }
      try {
        // 请求用户媒体权限（摄像头）
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        // 更新 Redux 状态，标记已获取媒体权限
        dispatch(updateCallStatus("haveMedia", true))

        // 将本地流添加到 Redux store
        dispatch(addStream("localStream", stream))

        // 创建 WebRTC 对等连接和远程流
        const { peerConnection, remoteStream } = await createPeerConnection()
        // 将远程流和对等连接添加到 Redux store
        dispatch(addStream("remote1", remoteStream, peerConnection))
      } catch (err) {
        // 处理获取媒体权限失败的情况
        console.log(err)
      }
    }
    fetchMedia()
  }, [])

  /**
   * 验证并解析 token
   * 从 URL 查询参数中获取 token，发送到后端验证并获取预约信息
   */
  useEffect(() => {
    const token = searchParams.get("token")
    const fetchDecodedToken = async () => {
      // 向后端发送 token 进行验证
      const res = await axios.post("https://localhost:9000/validate-link", {
        token,
      })
      // 保存解析后的预约信息
      setAppInfo(res.data)
    }
    fetchDecodedToken()
  }, [searchParams])

  return (
    <div className="main-video-page">
      <div className="video-chat-wrapper">
        {/* 大窗口：显示远程视频（对方视频） */}
        <video
          id="large-feed"
          ref={largeFeedEl}
          autoPlay
          controls
          playsInline
        ></video>
        {/* 小窗口：显示本地视频（自己的视频预览） */}
        <video
          id="own-feed"
          ref={smallFeedEl}
          autoPlay
          controls
          playsInline
        ></video>
        {/* 如果有预约信息，显示通话信息组件 */}
        {apptInfo.professionalsFullName ? (
          <CallInfo apptInfo={apptInfo} />
        ) : (
          <></>
        )}
        {/* 聊天窗口组件 */}
        <ChatWindow />
      </div>
      {/* 操作按钮组件（视频、音频、挂断等） */}
      <ActionButtons smallFeedEl={smallFeedEl} />
    </div>
  )
}

export default MainVideoPage
