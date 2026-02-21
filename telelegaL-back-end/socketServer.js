/**
 * Socket.IO 信令服务
 * 处理 WebRTC 信令：客户端 newOffer -> 转发给对应专业人员
 */

const io = require("./server").io

/** 已连接的专业人员列表（socketId, fullName） */
const connectedProfessionals = []

/** 所有已知的 offer，key 为 uuid */
const allKnownOffers = {}

io.on("connection", (socket) => {
  const fullName = socket.handshake.auth.fullName || "Pro"
  connectedProfessionals.push({ socketId: socket.id, fullName })

  socket.on("disconnect", () => {
    const idx = connectedProfessionals.findIndex((p) => p.socketId === socket.id)
    if (idx >= 0) connectedProfessionals.splice(idx, 1)
    Object.entries(allKnownOffers).forEach(([uuid, data]) => {
      const isClient = data.clientSocketId === socket.id
      const isPro = data.proSocketId === socket.id
      if (isClient || isPro) {
        const targetId = isClient ? data.proSocketId : data.clientSocketId
        if (targetId) {
          io.to(targetId).emit("peerDisconnected", { uuid })
        }
        delete allKnownOffers[uuid]
      }
    })
  })

  /**
   * 客户端发起 newOffer
   * 客户端发送: { offer, appInfo }
   * 转发给匹配 professionFullName 的专业人员
   */
  socket.on("newOffer", (data) => {
    const { offer, appInfo } = data || {}
    if (!appInfo || !appInfo.uuid) return
    allKnownOffers[appInfo.uuid] = {
      ...appInfo,
      offer,
      clientSocketId: socket.id,
      proSocketId: null,
      offerIceCandidates: [],
      answer: null,
      answerIceCandidates: [],
    }

    const p = connectedProfessionals.find(
      (p) => p.fullName === appInfo.professionFullName,
    )
    if (p) {
      socket.to(p.socketId).emit("newOffer", allKnownOffers[appInfo.uuid])
    }
  })

  /**
   * 专业人员发送 answer
   * 转发给客户端，并转发已缓存的 ICE 候选
   */
  socket.on("newAnswer", (data) => {
    const { answer, uuid } = data || {}
    if (!uuid || !answer) return
    const offerData = allKnownOffers[uuid]
    if (!offerData || !offerData.clientSocketId) return
    offerData.answer = answer
    offerData.proSocketId = socket.id
    io.to(offerData.clientSocketId).emit("newAnswer", { answer, uuid })
    offerData.offerIceCandidates.forEach((c) =>
      io.to(offerData.proSocketId).emit("iceCandidate", { candidate: c, uuid })
    )
  })

  /**
   * ICE 候选交换（双向转发，未连接时缓存）
   */
  socket.on("iceCandidate", (data) => {
    const { candidate, uuid, isFromClient } = data || {}
    if (!uuid || !candidate) return
    const offerData = allKnownOffers[uuid]
    if (!offerData) return
    const targetSocketId = isFromClient
      ? offerData.proSocketId
      : offerData.clientSocketId
    if (targetSocketId) {
      io.to(targetSocketId).emit("iceCandidate", { candidate, uuid })
    } else if (isFromClient) {
      offerData.offerIceCandidates.push(candidate)
    } else {
      offerData.answerIceCandidates = offerData.answerIceCandidates || []
      offerData.answerIceCandidates.push(candidate)
    }
  })

  /**
   * 聊天消息：转发给同一次通话的对方
   */
  socket.on("chatMessage", (data) => {
    const { uuid, from, text } = data || {}
    if (!uuid || !text) return
    const offerData = allKnownOffers[uuid]
    if (!offerData) return
    const isFromClient = socket.id === offerData.clientSocketId
    const targetId = isFromClient
      ? offerData.proSocketId
      : offerData.clientSocketId
    if (targetId) {
      io.to(targetId).emit("chatMessage", { from, text })
    }
  })
})
