/**
 * 通话信息组件
 * 显示预约信息和专业人员通知状态
 * 实时更新预约时间的相对时间显示（如 "5 minutes ago"）
 */

import moment from "moment"
import { useEffect, useState } from "react"

/**
 * CallInfo 组件
 * @param {Object} props - 组件属性
 * @param {Object} props.apptInfo - 预约信息对象
 * @param {string} props.apptInfo.professionalsFullName - 专业人员全名
 * @param {Date|string} props.apptInfo.apptDate - 预约日期时间
 */
const CallInfo = ({ apptInfo }) => {
  // 使用 moment.js 格式化预约时间的相对时间显示（如 "5 minutes ago"）
  const [momentText, setMomentText] = useState(
    moment(apptInfo.apptDate).fromNow()
  )

  /**
   * 定时更新相对时间显示
   * 每5秒更新一次，使时间显示保持最新
   */
  useEffect(() => {
    const timeInterval = setInterval(() => {
      // 更新相对时间文本
      setMomentText(moment(apptInfo.apptDate).fromNow())
    }, 5000)
    
    // 组件卸载时清除定时器
    return () => {
      console.log("Clearing")
      clearInterval(timeInterval)
    }
  }, [])

  return (
    <div className="call-info">
      <h1>
        {apptInfo.professionalsFullName} has been notified.
        <br />
        Your appointment is {momentText}.
      </h1>
    </div>
  )
}

export default CallInfo
