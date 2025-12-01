// this is where all express stuff happens (routes)
const app = require("./server").app

app.get("/test", (req, res) => {
  res.json(" this is a test route")
})
