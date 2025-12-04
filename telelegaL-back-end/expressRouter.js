// this is where all express stuff happens (routes)
const app = require("./server").app
const jwt = require("jsonwebtoken")
const linkSecret = "whitenight118"

// this route is for us
app.get("/user-link", (req, res) => {
  const appData = {
    professionFullName: "Joey Xia D",
    appDate: Date.now(),
  }

  const token = jwt.sign(appData, linkSecret)
  res.send(`https://localhost:3000/join-video?token=${token}`)
})

app.post("/validate-link", (req, res) => {
  const token = req.body.token
  const decodedData = jwt.verify(token, linkSecret)
  res.json(decodedData)
})
