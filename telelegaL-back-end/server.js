/**
 * 服务入口：创建 HTTPS + Express + Socket.IO 服务器
 * 为前端提供 API 与 WebSocket 信令
 */

const fs = require("fs")
const https = require("https")
const express = require("express")
const cors = require("cors")
const socketio = require("socket.io")

const app = express()

app.use(cors())
app.use(express.static(__dirname + "/public"))
app.use(express.json())

// 读取 HTTPS 证书（开发环境自签名证书）
const key = fs.readFileSync("./certs/create-cert-key.pem")
const cert = fs.readFileSync("./certs/create-cert.pem")

const expressServer = https.createServer({ key, cert }, app)
const io = socketio(expressServer, {
  cors: [
    "https://localhost:3000",
    "https://localhost:3001",
    "https://localhost:3002",
  ],
})

expressServer.listen(9000, () => {
  console.log("Server is running on https://localhost:9000")
})

module.exports = {
  io,
  expressServer,
  app,
}
