/**
 * 音频按钮组件
 * 用于控制音频的加入、静音和取消静音
 * 根据当前通话状态显示不同的按钮文本
 */

import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import getDevices from "../../webRTCutilities/getDevices"
import ActionButtonCaretDropDown from "../ActionButtonCaretDropDown"

const AudioButton = () => {
  // 从 Redux store 获取通话状态
  const callStatus = useSelector((state) => state.callStatus)
  const [caretOpen, setCaretOpen] = useState(false)
  const [audioDevicesList, setAudioDevicesList] = useState([])

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

  const changeAudioDevice = async (e) => {
    const deviceId = e.target.value
    const newConstraints = {
      audio: {
        deviceId: { exact: deviceId },
      },
    }
    const stream = await navigator.mediaDevices.getUserMedia(newConstraints)
  }

  useEffect(() => {
    const fetchDevices = async () => {
      if (caretOpen) {
        const devices = await getDevices()
        setAudioDevicesList(
          devices.audioInputDevices.concat(devices.audioOutputDevices),
        )
      }
    }
    fetchDevices()
  }, [caretOpen])

  return (
    <div className="button-wrapper d-inline-block">
      <i
        className="fa fa-caret-up choose-audio"
        onClick={() => setCaretOpen(!caretOpen)}
      ></i>
      <div className="button mic">
        <i className="fa fa-microphone"></i>
        <div className="btn-text">{micText}</div>
      </div>
      {caretOpen ? (
        <ActionButtonCaretDropDown
          defaultValue={callStatus.audioDevice || "default"}
          changeHandler={changeAudioDevice}
          devicesList={audioDevicesList}
          type="audio"
        />
      ) : (
        <></>
      )}
    </div>
  )
}

export default AudioButton
