import peerConfiguration from "./stunServer"

const createPeerConnection = () => {
  return new Promise(async (resolve, reject) => {
    const peerConnection = await new RTCPeerConnection(peerConfiguration)

    const remoteStrem = new MediaStream()

    peerConnection.addEventListener("signalingstatechange", (e) => {
      console.log("signaling state change")
      console.log(e)
    })
    peerConnection.addEventListener("icecandidate", (e) => {
      console.log("found ice candidate")
      if (e.candidate) {
      }
    })
    resolve({
      peerConnection,
      remoteStrem,
    })
  })
}

export default createPeerConnection
