/**
 * 专业人员 Socket 连接
 * 根据 token 解析身份并建立带 auth 的 Socket.IO 连接
 * 后端通过 socket.handshake.auth.fullName 路由 newOffer
 */

import { io } from "socket.io-client"
import { API_BASE } from "../config"

/**
 * 从 JWT token 中解析 payload（不验证签名，仅用于获取 claims）
 */
const decodeJwtPayload = (token) => {
  try {
    const base64 = token.split(".")[1]
    if (!base64) return null
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"))
    return JSON.parse(json)
  } catch {
    return null
  }
}

/**
 * 创建专业人员用的 Socket 连接
 * @param {string} token - JWT token，内含 professionFullName 等
 * @returns {object} Socket.IO 实例
 */
const socketConnection = (token) => {
  const payload = token ? decodeJwtPayload(token) : null
  const fullName = payload?.professionFullName ?? "Pro"

  const socket = io(API_BASE, {
    auth: { fullName },
  })

  return socket
}

export default socketConnection
