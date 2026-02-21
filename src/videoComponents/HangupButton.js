/**
 * 挂断按钮组件
 * 关闭 PeerConnection、停止所有轨道、清空 Redux、返回首页
 */

import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import endCall from "../redux-elements/actions/endCall"

const HangupButton = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const callStatus = useSelector((state) => state.callStatus)
  const streams = useSelector((state) => state.streams)

  const hangupCall = () => {
    Object.entries(streams).forEach(([, val]) => {
      if (val?.stream?.getTracks) {
        val.stream.getTracks().forEach((t) => t.stop())
      }
      if (val?.peerConnection) {
        val.peerConnection.close()
      }
    })
    dispatch(endCall())
    navigate("/")
  }

  if (callStatus.current === "complete") {
    return null
  }

  return (
    <button onClick={hangupCall} className="btn btn-danger hang-up">
      挂断
    </button>
  )
}

export default HangupButton
