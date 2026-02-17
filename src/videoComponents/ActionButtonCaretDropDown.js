const ActionButtonCaretDropDown = ({
  defaultValue,
  changeHandler,
  devicesList,
}) => {
  return (
    <div className="caret-dropdown" style={{ top: "-25px" }}>
      <select defaultValue={defaultValue} onChange={changeHandler}>
        {devicesList.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default ActionButtonCaretDropDown
