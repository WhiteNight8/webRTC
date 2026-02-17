/**
 * 视频按钮组件
 * 用于控制视频流的开启和关闭，显示本地视频预览
 */

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import startLocalStream from "./startLocalStream"
import updateCallStatus from "../../redux-elements/actions/updateCallStatus"
import addStream from "../../redux-elements/actions/addStream"
import getDevices from "../../webRTCutilities/getDevices"
import ActionButtonCaretDropDown from "../ActionButtonCaretDropDown"
/**
 * VideoButton 组件
 * @param {Object} props - 组件属性
 * @param {Object} props.smallFeedEl - React ref，指向小窗口视频元素（本地预览）
 */
const VideoButton = ({ smallFeedEl }) => {
  // 从 Redux store 获取通话状态和流信息
  const dispatch = useDispatch()
  const callStatus = useSelector((state) => state.callStatus)
  const streams = useSelector((state) => state.streams)
  // 标记是否有待处理的更新（当媒体尚未准备好时）
  const [pendingUpdate, setPendingUpdate] = useState(false)
  const [caretOpen, setCaretOpen] = useState(false)
  const [videoDevicesList, setVideoDevicesList] = useState([])

  useEffect(() => {
    const fetchDevices = async () => {
      if (caretOpen) {
        const devices = await getDevices()
        setVideoDevicesList(devices.videoDevices)
      }
    }
    fetchDevices()
  }, [caretOpen])

  const changeVideoDevice = async (e) => {
    const deviceId = e.target.value
    const newConstraints = {
      audio: callStatus.audio === "default" ? true : false,
      video: {
        deviceId: { exact: deviceId },
      },
    }
    const stream = await navigator.mediaDevices.getUserMedia(newConstraints)

    dispatch(updateCallStatus("videoDevice", deviceId))
    dispatch(updateCallStatus("video", "enabled"))
    smallFeedEl.current.srcObject = stream
    dispatch(addStream("localStream", stream))
  }

  /**
   * 启动或停止视频流
   * 如果媒体已准备好，立即启动视频并显示预览
   * 否则标记为待更新，等待媒体准备好后再处理
   */
  const startStopVideo = () => {
    // 检查是否已获取媒体权限且本地流已存在
    if (callStatus.video === "enabled") {
      dispatch(updateCallStatus("video", "disabled"))

      const tracks = streams.localStream.stream.getVideoTracks()
      tracks.forEach((t) => {
        t.enabled = false
      })
    } else if (callStatus.video === "disabled") {
      dispatch(updateCallStatus("video", "enabled"))
      const tracks = streams.localStream.stream.getVideoTracks()
      tracks.forEach((t) => {
        t.enabled = true
      })
    } else if (callStatus.hasMedia) {
      smallFeedEl.current.srcObject = streams.localStream.stream

      startLocalStream(streams, dispatch)
    } else {
      setPendingUpdate(true)
    }
  }

  /**
   * 监听媒体准备状态
   * 当媒体准备好且有待处理的更新时，自动设置视频预览
   */
  useEffect(() => {
    if (pendingUpdate && callStatus.haveMedia) {
      setPendingUpdate(false)
      // 将本地视频流设置到预览窗口
      smallFeedEl.current.srcObject = streams.localStream.stream
      startLocalStream(streams, dispatch)
    }
  }, [pendingUpdate, callStatus.haveMedia, dispatch, smallFeedEl, streams])

  return (
    <div className="button-wrapper video-button d-inline-block">
      <i
        className="fa fa-caret-up choose-video"
        onClick={() => setCaretOpen(!caretOpen)}
      ></i>
      <div className="button camera" onClick={startStopVideo}>
        <i className="fa fa-video"></i>
        <div className="btn-text">
          {/* 根据视频状态显示 "Stop" 或 "Start" */}
          {callStatus.video === "enabled" ? "Stop" : "Start"} Video
        </div>
      </div>
      {caretOpen ? (
        <ActionButtonCaretDropDown
          defaultValue={callStatus.videoDevice || "default"}
          changeHandler={changeVideoDevice}
          devicesList={videoDevicesList}
        />
      ) : (
        <></>
      )}
    </div>
  )
}

export default VideoButton
