const getDevices = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput",
      )
      const audioOutputDevices = devices.filter(
        (device) => device.kind === "audiooutput",
      )
      const audioInputDevices = devices.filter(
        (device) => device.kind === "audioinput",
      )
      resolve({
        videoDevices,
        audioOutputDevices,
        audioInputDevices,
      })
    } catch (err) {
      reject(err)
    }
  })
}

export default getDevices
