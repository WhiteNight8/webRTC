/**
 * 专业人员仪表盘 Socket 监听器
 * 监听 newOffer 事件，当客户端发起视频邀请时更新预约列表并标记为 waiting
 */

/**
 * 为 ProDashboard 设置 Socket 监听
 * @param {object} socket - Socket.IO 实例
 * @param {Function} setApptInfo - 更新预约列表的 setState
 * @param {Function} dispatch - Redux dispatch（预留）
 */
const proDashboardSocketListeners = (socket, setApptInfo, dispatch) => {
  socket.on("newOffer", (offerData) => {
    setApptInfo((prev) => {
      const item = {
        ...offerData,
        waiting: true,
      }
      const idx = prev.findIndex((a) => a.uuid === offerData.uuid)
      const next = [...prev]
      if (idx >= 0) {
        next[idx] = { ...next[idx], ...item }
      } else {
        next.push(item)
      }
      return next
    })
  })
}

export default {
  proDashboardSocketListeners,
}
