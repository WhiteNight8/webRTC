/**
 * Express 路由模块
 * 提供预约链接生成、JWT 验证、专业人员链接等 API
 */

const app = require("./server").app
const jwt = require("jsonwebtoken")
const { v4: uuidv4 } = require("uuid")

/** JWT 签名密钥，生产环境应从环境变量读取 */
const linkSecret = process.env.LINK_SECRET || "whitenight118"

/** 预约列表（内存存储，生产环境应使用数据库） */
const professionalAppointments = []

app.set("professionalAppointments", professionalAppointments)

/**
 * 生成客户端视频链接
 * GET /user-link
 * 返回带 JWT token 的 /join-video 链接，供客户加入视频通话
 */
app.get("/user-link", (req, res) => {
  const uuid = uuidv4()

  const appData = {
    professionFullName: "Joey Xia D",
    appDate: Date.now(),
    uuid: uuid,
    clientName: "Client",
  }

  professionalAppointments.push(appData)

  const token = jwt.sign(appData, linkSecret)
  res.send(`https://localhost:3000/join-video?token=${token}`)
})

/**
 * 验证预约链接 Token
 * POST /validate-link
 * Body: { token: string }
 * 返回解码后的预约信息（professionFullName, appDate, uuid, clientName 等）
 */
app.post("/validate-link", (req, res) => {
  const token = req.body.token
  const decodedData = jwt.verify(token, linkSecret)
  res.json(decodedData)
})

/**
 * 生成专业人员仪表盘链接
 * GET /pro-link
 * 返回带 JWT token 的 /dashboard 链接，供专业人员查看预约并加入通话
 */
app.get("/pro-link", (req, res) => {
  const uuid = uuidv4()
  const appData = {
    professionFullName: "Joey Xia D",
    appDate: Date.now(),
    uuid: uuid,
    clientName: "Client",
  }
  professionalAppointments.push(appData)
  const token = jwt.sign(appData, linkSecret)
  res.send(`https://localhost:3000/dashboard?token=${token}`)
})
