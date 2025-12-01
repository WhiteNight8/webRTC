// all socketServer stuff happens here
const io = require("./server").io

io.on("connection", (socket) => {
  console.log(socket.id, "New client connected")
})
