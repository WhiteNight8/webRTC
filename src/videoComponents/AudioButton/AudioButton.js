/**
 * 音频按钮组件
 * 用于控制音频的加入、静音和取消静音
 * 根据当前通话状态显示不同的按钮文本
 */

import { useSelector } from "react-redux"

const AudioButton = () => {
  // 从 Redux store 获取通话状态
  const callStatus = useSelector((state) => state.callStatus)

  /**
   * 根据通话状态确定按钮显示的文本
   * - 空闲状态：显示 "Join Audio"（加入音频）
   * - 音频已启用：显示 "Mute"（静音）
   * - 音频已静音：显示 "Unmute"（取消静音）
   */
  let micText
  if (callStatus.current === "idle") {
    micText = "Join Audio"
  } else if (callStatus.audio) {
    micText = "Mute"
  } else {
    micText = "Unmute"
  }
  
  return (
    <div className="button-wrapper d-inline-block">
      <i className="fa fa-caret-up choose-audio"></i>
      <div className="button mic">
        <i className="fa fa-microphone"></i>
        <div className="btn-text">{micText}</div>
      </div>
    </div>
  )
}

export default AudioButton
