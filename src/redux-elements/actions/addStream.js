export default (who, streamn, peerConnection) => {
  return {
    type: "ADD_STREAM",
    payload: {
      who,
      streamn,
      peerConnection,
    },
  }
}
