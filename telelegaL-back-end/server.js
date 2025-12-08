// this is where we create the express and socketio server

const fs = require("fs")
const https = require("https")
const express = require("express")
const cors = require("cors")
app.use(cors())

const socketio = require("socket.io")
const app = express()
app.use(express.static(__dirname + "/public"))
app.use(express.json())

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
