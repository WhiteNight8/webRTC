/**
 * Redux Reducer: 通话状态管理
 * 管理视频通话的各种状态信息
 */

/**
 * 初始状态定义
 */
const initState = {
  // 当前通话状态: "idle"（空闲）, "negotiating"（协商中）, "progress"（进行中）, "complete"（完成）
  current: "idle",

  // 视频流状态: "off"（关闭）, "enabled"（已启用）, "disabled"（已禁用）, "complete"（完成）
  video: "off",

  // 音频流状态: "off"（关闭）, "enabled"（已启用）, "disabled"（已禁用）, "complete"（完成）
  audio: "off",

  // 音频输入设备（我们只关心输入设备，不关心输出设备）
  audioDevice: "default",

  // 视频输入设备
  videoDevice: "default",

  // 是否正在共享屏幕
  shareScreen: false,

  // 是否已获取本地媒体流（是否已调用 getUserMedia）
  haveMedia: false,

  // 是否已创建 WebRTC offer
  haveCreatedOffer: false,
}

/**
 * Reducer 函数
 * @param {Object} state - 当前状态
 * @param {Object} action - Redux action 对象
 * @returns {Object} 新的状态对象
 */
export default (state = initState, action) => {
  // 更新通话状态的某个属性
  if (action.type === "UPDATE_CALL_STATUS") {
    const copyState = { ...state }
    // 根据 action.payload.prop 更新对应的属性值
    copyState[action.payload.prop] = action.payload.value
    return copyState
  }
  // 登出或新版本时重置为初始状态
  else if (action.type === "LOGOUT_ACTION" || action.type === "NEW_VERSION") {
    return initState
  }
  // 其他 action 不改变状态
  else {
    return state
  }
}
