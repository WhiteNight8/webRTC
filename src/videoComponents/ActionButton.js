/**
 * 操作按钮组件
 * 包含视频通话的所有控制按钮：音频、视频、参与者、聊天、屏幕共享、挂断
 * 实现鼠标移动时显示/隐藏按钮的自动隐藏功能
 */

import { useState, useEffect, useRef } from "react"
// import { useDispatch, useSelector } from 'react-redux';
import HangupButton from "./HangupButton"
import socket from "../webRTCutilities/socketConnect"
import { useSelector } from "react-redux"
import VideoButton from "./VideoButton/VideoButton"
import AudioButton from "./AudioButton/AudioButton"

/**
 * ActionButtons 组件
 * @param {Object} props - 组件属性
 * @param {Function} props.openCloseChat - 打开/关闭聊天窗口的函数
 * @param {Object} props.smallFeedEl - React ref，指向小窗口视频元素
 */
const ActionButtons = ({ openCloseChat, smallFeedEl }) => {
  // 从 Redux store 获取通话状态
  const callStatus = useSelector((state) => state.callStatus)
  // 菜单按钮容器的引用
  const menuButtons = useRef(null)
  // 用于存储定时器的变量
  let timer

  /**
   * 设置自动隐藏定时器
   * 当通话不在空闲状态时，4秒无鼠标移动后自动隐藏按钮
   */
  useEffect(() => {
    const setTimer = () => {
      // 只有在通话进行中时才设置自动隐藏
      if (callStatus.current !== "idle") {
        timer = setTimeout(() => {
          // 4秒无鼠标移动后隐藏按钮菜单
          menuButtons.current.classList.add("hidden")
        }, 4000)
      }
    }

    /**
     * 监听鼠标移动事件
     * 实现按钮菜单的自动显示/隐藏功能
     */
    window.addEventListener("mousemove", () => {
      // 如果按钮当前是隐藏状态，显示它并启动定时器
      if (
        menuButtons.current &&
        menuButtons.current.classList &&
        menuButtons.current.classList.contains("hidden")
      ) {
        // 移除隐藏类，显示按钮
        menuButtons.current.classList.remove("hidden")
        setTimer()
      } else {
        // 如果按钮已显示，清除旧定时器并重新设置
        clearTimeout(timer)
        setTimer()
      }
    })
  }, [])

  return (
    <div id="menu-buttons" ref={menuButtons} className="row">
      {/* 左侧按钮组：音频和视频控制 */}
      <div className="left col-2">
        <AudioButton />
        <VideoButton smallFeedEl={smallFeedEl} />
      </div>

      {/* 中间按钮组：参与者、聊天、屏幕共享 */}
      <div className="col-8 text-center">
        {/* 参与者按钮 */}
        <div className="button-wrapper d-inline-block">
          <i className="fa fa-caret-up choose-video"></i>
          <div className="button participants">
            <i className="fa fa-users"></i>
            <div className="btn-text">Participants</div>
          </div>
        </div>
        {/* 聊天按钮 */}
        <div className="button-no-caret d-inline-block">
          <div className="button participants">
            <i className="fa fa-comment" onClick={openCloseChat}></i>
            <div className="btn-text" onClick={openCloseChat}>
              Chat
            </div>
          </div>
        </div>
        {/* 屏幕共享按钮 */}
        <div className="button-no-caret participants d-inline-block">
          <div className="button participants">
            <i className="fa fa-desktop"></i>
            <div className="btn-text">Share Screen</div>
          </div>
        </div>
      </div>

      {/* 右侧按钮组：挂断按钮 */}
      <div className="center justify-center text-end col-2">
        <HangupButton />
      </div>
    </div>
  )
}

export default ActionButtons
