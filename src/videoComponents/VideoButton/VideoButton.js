/**
 * 视频按钮组件
 * 用于控制视频流的开启和关闭，显示本地视频预览
 */

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import startLocalStream from "./startLocalStream"

/**
 * VideoButton 组件
 * @param {Object} props - 组件属性
 * @param {Object} props.smallFeedEl - React ref，指向小窗口视频元素（本地预览）
 */
const VideoButton = ({ smallFeedEl }) => {
  // 从 Redux store 获取通话状态和流信息
  const callStatus = useSelector((state) => state.callStatus)
  const streams = useSelector((state) => state.streams)
  const dispatch = useDispatch()

  // 标记是否有待处理的更新（当媒体尚未准备好时）
  const [pendingUpdate, setPendingUpdate] = useState(false)

  /**
   * 启动或停止视频流
   * 如果媒体已准备好，立即启动视频并显示预览
   * 否则标记为待更新，等待媒体准备好后再处理
   */
  const startStopVideo = () => {
    // 检查是否已获取媒体权限且本地流已存在
    if (
      callStatus.haveMedia &&
      streams.localStream &&
      streams.localStream.stream
    ) {
      // 将本地视频流设置到小窗口预览元素
      smallFeedEl.current.srcObject = streams.localStream.stream

      // 启动本地流，将视频轨道添加到所有对等连接
      startLocalStream(streams, dispatch)
    } else {
      // 媒体尚未准备好，标记为待更新
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
    }
  }, [pendingUpdate, callStatus.haveMedia])

  return (
    <div className="button-wrapper video-button d-inline-block">
      <i className="fa fa-caret-up choose-video"></i>
      <div className="button camera" onClick={startStopVideo}>
        <i className="fa fa-video"></i>
        <div className="btn-text">
          {/* 根据视频状态显示 "Stop" 或 "Start" */}
          {callStatus.video === "display" ? "Stop" : "Start"} Video
        </div>
      </div>
    </div>
  )
}

export default VideoButton
