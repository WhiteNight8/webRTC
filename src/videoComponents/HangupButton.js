/**
 * 挂断按钮组件
 * 用于结束视频通话，将通话状态更新为完成状态
 */

import { useDispatch, useSelector } from "react-redux"
import updateCallStatus from "../redux-elements/actions/updateCallStatus"

const HangupButton = () => {
  const dispatch = useDispatch()
  // 从 Redux store 获取通话状态
  const callStatus = useSelector((state) => state.callStatus)

  /**
   * 挂断通话
   * 将通话状态更新为 "complete"（完成），结束当前通话
   */
  const hangupCall = () => {
    dispatch(updateCallStatus("current", "complete"))
  }

  // 如果通话已完成，不显示挂断按钮
  if (callStatus.current === "complete") {
    return <></>
  }

  return (
    <button onClick={hangupCall} className="btn btn-danger hang-up">
      Hang Up
    </button>
  )
}

export default HangupButton
