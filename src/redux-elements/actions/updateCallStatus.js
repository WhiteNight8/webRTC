/**
 * Redux Action: 更新通话状态
 * 用于更新通话相关的状态信息（如视频状态、音频状态、媒体权限等）
 * 
 * @param {string} prop - 要更新的属性名（如 "video", "audio", "haveMedia" 等）
 * @param {any} value - 属性的新值
 * @returns {Object} Redux action 对象
 */
export default (prop, value) => {
  return {
    type: "UPDATE_CALL_STATUS",
    payload: { prop, value },
  }
}
