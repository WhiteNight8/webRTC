const ActionButtonCaretDropDown = ({
  defaultValue,
  changeHandler,
  devicesList,
  type,
}) => {
  let dropDownEl
  if (type === "video") {
    dropDownEl = devicesList.map((device, index) => (
      <option
        key={
          device.deviceId ? `${device.deviceId}-${index}` : `device-${index}`
        }
        value={device.deviceId}
      >
        {device.label}
      </option>
    ))
  } else if (type === "audio") {
    const audioInputOptions = devicesList
      .filter((d) => d.kind === "audioinput")
      .map((d, i) => (
        <option
          key={`audioinput-${d.deviceId || "device"}-${i}`}
          value={`audioinput-${d.deviceId || "default"}`}
        >
          {d.label || `Audio input ${i + 1}`}
        </option>
      ))

    const audioOutputOptions = devicesList
      .filter((d) => d.kind === "audiooutput")
      .map((d, i) => (
        <option
          key={`audiooutput-${d.deviceId || "device"}-${i}`}
          value={`audiooutput-${d.deviceId || "default"}`}
        >
          {d.label || `Audio output ${i + 1}`}
        </option>
      ))

    dropDownEl = [
      <optgroup key="audio-input-group" label="Input Devices">
        {audioInputOptions}
      </optgroup>,
      <optgroup key="audio-output-group" label="Output Devices">
        {audioOutputOptions}
      </optgroup>,
    ]
  }
  return (
    <div className="caret-dropdown" style={{ top: "-25px" }}>
      <select defaultValue={defaultValue} onChange={changeHandler}>
        {dropDownEl}
      </select>
    </div>
  )
}

export default ActionButtonCaretDropDown
