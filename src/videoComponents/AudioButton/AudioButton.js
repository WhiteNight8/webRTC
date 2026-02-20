/**
 * 音频按钮组件
 * 用于控制音频的加入、静音和取消静音
 * 根据当前通话状态显示不同的按钮文本
 */

import { useEffect, useState } from "react"
import { useSelector, useDispatch, useStore } from "react-redux"
import getDevices from "../../webRTCutilities/getDevices"
import ActionButtonCaretDropDown from "../ActionButtonCaretDropDown"
import addStream from "../../redux-elements/actions/addStream"
import updateCallStatus from "../../redux-elements/actions/updateCallStatus"
import startAudioStream from "./startAudioStream"

/**
 * AudioButton 组件
 * @param {Object} props - 组件属性
 * @param {Object} props.smallFeedEl - React ref，指向小窗口视频元素（用于显示本地音频流预览）
 */
const AudioButton = ({ smallFeedEl }) => {
  // 从 Redux store 获取通话状态和流
  const callStatus = useSelector((state) => state.callStatus)
  const streams = useSelector((state) => state.streams)
  const dispatch = useDispatch()
  const store = useStore()
  // caretOpen：控制设备下拉列表的展开/收起
  const [caretOpen, setCaretOpen] = useState(false)
  // audioDevicesList：麦克风和扬声器设备列表
  const [audioDevicesList, setAudioDevicesList] = useState([])

  /**
   * 根据音频状态确定按钮显示的文本
   * - 音频已启用：显示 "Mute"（静音）
   * - 音频已静音：显示 "Unmute"（取消静音）
   * - 未加入音频（off）：显示 "Join Audio"（加入音频）
   */
  let micText
  if (callStatus.audio === "enabled") {
    micText = "Mute"
  } else if (callStatus.audio === "disabled") {
    micText = "Unmute"
  } else {
    micText = "Join Audio"
  }

  /**
   * 开启/关闭音频：静音、取消静音或首次加入音频
   * - 已启用：关闭音频轨道（静音）
   * - 已静音：重新启用音频轨道（取消静音）
   * - 未加入：使用默认麦克风加入音频，并 addTrack 到各 remote peerConnection
   */
  const startStopAudio = () => {
    if (callStatus.audio === "enabled") {
      // 静音：关闭音频轨道
      dispatch(updateCallStatus("audio", "disabled"))
      const tracks = streams?.localStream?.stream?.getAudioTracks() ?? []
      tracks.forEach((t) => {
        t.enabled = false
      })
    } else if (callStatus.audio === "disabled") {
      // 取消静音：重新启用音频轨道
      dispatch(updateCallStatus("audio", "enabled"))
      const tracks = streams?.localStream?.stream?.getAudioTracks() ?? []
      tracks.forEach((t) => {
        t.enabled = true
      })
    } else {
      // 首次加入音频：使用默认麦克风获取流，addTrack 到各 remote，并更新状态
      // value 格式需与 ActionButtonCaretDropDown 一致：audioinput-{deviceId}
      // 必须 await：startAudioStream 需要 Redux 中已更新的 localStream（含音频轨道）
      ;(async () => {
        await changeAudioDevice({ target: { value: "audioinput-default" } })
        const latestStreams = store.getState().streams
        startAudioStream(latestStreams, dispatch)
      })()
    }
  }

  /**
   * 切换音频设备（麦克风或扬声器）
   * - audiooutput：调用 setSinkId 切换扬声器
   * - audioinput：getUserMedia 获取新麦克风流，更新 Redux 与预览
   */
  const changeAudioDevice = async (e) => {
    if (!smallFeedEl?.current) return
    const value = e.target.value
    const dashIdx = value.indexOf("-")
    const audioType = value.slice(0, dashIdx)
    const deviceId = value.slice(dashIdx + 1)
    if (audioType === "audiooutput") {
      await smallFeedEl.current.setSinkId(deviceId)
    } else if (audioType === "audioinput") {
      // 获取指定麦克风的音频流，更新预览与 Redux
      // deviceId 为 "default" 或空时用 audio: true，兼容各浏览器（不保证有字面量 "default" 的设备 ID）
      const newConstraints = {
        audio:
          deviceId && deviceId !== "default"
            ? { deviceId: { exact: deviceId } }
            : true,
      }
      const stream = await navigator.mediaDevices.getUserMedia(newConstraints)
      smallFeedEl.current.srcObject = stream
      dispatch(updateCallStatus("audioDevice", deviceId))
      dispatch(updateCallStatus("audio", "enabled"))
      dispatch(addStream("localStream", stream))
    }
  }

  // 当 caret 展开时拉取麦克风/扬声器列表供下拉选择
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
      <div className="button mic" onClick={startStopAudio}>
        <i className="fa fa-microphone"></i>
        <div className="btn-text">{micText}</div>
      </div>
      {caretOpen ? (
        <ActionButtonCaretDropDown
          defaultValue={`audioinput-${callStatus.audioDevice || "default"}`}
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
