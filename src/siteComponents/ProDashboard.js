/**
 * 专业人员仪表盘
 * 工作台、日历、设置
 */
import { useEffect, useState } from "react"
import "./ProDashboard.css"
import { useSearchParams, useNavigate } from "react-router-dom"
import socketConnection from "../webRTCutilities/socketConnection"
import proSocketListeners from "../webRTCutilities/proSocketListeners"
import moment from "moment"
import "moment/locale/zh-cn"
moment.locale("zh-cn")

const decodeTokenName = (token) => {
  if (!token) return null
  try {
    const base64 = token.split(".")[1]
    if (!base64) return null
    const json = JSON.parse(atob(base64.replace(/-/g, "+").replace(/_/g, "/")))
    return json.professionFullName || "专业人员"
  } catch {
    return null
  }
}

const SETTINGS_KEY = "telelegal_pro_settings"

const ProDashboard = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [apptInfo, setApptInfo] = useState([])
  const [connected, setConnected] = useState(false)
  const [activeTab, setActiveTab] = useState("work")
  const [copyFeedback, setCopyFeedback] = useState(false)
  const [settings, setSettings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}")
    } catch {
      return {}
    }
  })

  const token = searchParams.get("token")
  const proName = settings.displayName || decodeTokenName(token)

  useEffect(() => {
    if (!token) return
    const socket = socketConnection(token)
    socket.on("connect", () => setConnected(true))
    socket.on("disconnect", () => setConnected(false))
    proSocketListeners.proDashboardSocketListeners(socket, setApptInfo, () => {})
    return () => socket.disconnect()
  }, [searchParams, token])

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  }, [settings])

  const joinCall = (appt) => {
    navigate(
      `/join-video-pro?token=${token}&uuid=${appt.uuid}&client=${encodeURIComponent(appt.clientName || "客户")}`,
      { state: { offerData: appt } },
    )
  }

  const waitingList = apptInfo.filter((a) => a.waiting)
  const scheduledList = apptInfo.filter((a) => !a.waiting)
  const clientNames = [...new Set(apptInfo.map((a) => a.clientName).filter(Boolean))]

  const apptByDate = apptInfo.reduce((acc, a) => {
    const d = moment(a.apptDate).format("YYYY-MM-DD")
    if (!acc[d]) acc[d] = []
    acc[d].push(a)
    return acc
  }, {})

  const dashboardUrl = token
    ? `${window.location.origin}/dashboard?token=${token}`
    : ""

  if (!token) {
    return (
      <div className="pro-dashboard pro-dashboard--no-token">
        <div className="no-token-card">
          <i className="fa fa-link-slash"></i>
          <h2>请使用专业人员链接访问</h2>
          <p>请通过 GET /pro-link 获取带 token 的仪表盘链接</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pro-dashboard container">
      <div className="row">
        <div className="col-12 main-border purple-bg">
          <span className="connection-badge" data-connected={connected}>
            {connected ? "已连接" : "连接中…"}
          </span>
          {proName && <span className="pro-name">{proName}</span>}
        </div>
      </div>
      <div className="row">
        <aside className="col-3 purple-bg left-rail">
          <div className="user-avatar">
            <i className="fa fa-user"></i>
          </div>
          <nav className="side-nav">
            <div
              className={`menu-item ${activeTab === "work" ? "active" : ""}`}
              onClick={() => setActiveTab("work")}
            >
              <i className="fa fa-table-columns"></i>
              <span>工作台</span>
            </div>
            <div
              className={`menu-item ${activeTab === "calendar" ? "active" : ""}`}
              onClick={() => setActiveTab("calendar")}
            >
              <i className="fa fa-calendar"></i>
              <span>日历</span>
            </div>
            <div
              className={`menu-item ${activeTab === "settings" ? "active" : ""}`}
              onClick={() => setActiveTab("settings")}
            >
              <i className="fa fa-gear"></i>
              <span>设置</span>
            </div>
          </nav>
        </aside>
        <main className="col-9 dash-main">
          {activeTab === "work" && (
            <>
              <h1 className="dash-title">工作台</h1>
          <div className="dash-box dash-box--waiting">
            <h4>
              <i className="fa fa-clock"></i> 等待接听
              {waitingList.length > 0 && (
                <span className="waiting-badge">{waitingList.length} 人在线</span>
              )}
            </h4>
            {waitingList.length === 0 ? (
              <p className="empty-msg">暂无客户等待，有新呼叫时会显示在这里</p>
            ) : (
              <ul className="waiting-list">
                {waitingList.map((a) => (
                  <li key={a.uuid} className="waiting-item">
                    <span className="waiting-dot"></span>
                    <span className="waiting-client">{a.clientName || "客户"}</span>
                    <span className="waiting-time">
                      {moment(a.apptDate).calendar()} · 已发起通话
                    </span>
                    <button
                      className="btn-join"
                      onClick={() => joinCall(a)}
                    >
                      <i className="fa fa-phone"></i> 立即接听
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="row dash-row">
            <div className="col-md-6">
              <div className="dash-box dash-box--clients">
                <h4><i className="fa fa-users"></i> 客户列表</h4>
                <ul>
                  {clientNames.length ? (
                    clientNames.map((name, i) => (
                      <li key={i}>{name}</li>
                    ))
                  ) : (
                    <li className="empty">暂无客户</li>
                  )}
                </ul>
              </div>
            </div>
            <div className="col-md-6">
              <div className="dash-box dash-box--appointments">
                <h4><i className="fa fa-calendar-check"></i> 预约列表</h4>
                <ul>
                  {scheduledList.length === 0 ? (
                    <li className="empty">暂无预约</li>
                  ) : (
                    scheduledList.map((a) => (
                      <li key={a.uuid} className="appt-item">
                        <span className="appt-client">{a.clientName || "客户"}</span>
                        <span className="appt-time">{moment(a.apptDate).calendar()}</span>
                        <span className="appt-status">待呼叫</span>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          </div>
            </>
          )}

          {activeTab === "calendar" && (
            <div className="dash-panel dash-panel--calendar">
              <h1 className="dash-title">日历</h1>
              <p className="panel-desc">按日期查看预约</p>
              {Object.keys(apptByDate).length === 0 ? (
                <div className="dash-box">
                  <p className="empty-msg">暂无预约记录</p>
                </div>
              ) : (
                <div className="calendar-list">
                  {Object.entries(apptByDate)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([date, list]) => (
                      <div key={date} className="calendar-day">
                        <div className="calendar-day-header">
                          {moment(date).format("YYYY年M月D日 dddd")}
                          <span className="day-count">{list.length} 个预约</span>
                        </div>
                        <ul>
                          {list.map((a) => (
                            <li key={a.uuid} className="calendar-item">
                              <span className="cal-client">{a.clientName || "客户"}</span>
                              <span className="cal-time">
                                {moment(a.apptDate).format("HH:mm")}
                              </span>
                              {a.waiting ? (
                                <button
                                  className="btn-join btn-join--sm"
                                  onClick={() => joinCall(a)}
                                >
                                  接听
                                </button>
                              ) : (
                                <span className="cal-status">已安排</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div className="dash-panel dash-panel--settings">
              <h1 className="dash-title">设置</h1>
              <div className="dash-box settings-form">
                <div className="setting-row">
                  <label>显示名称</label>
                  <input
                    type="text"
                    value={settings.displayName ?? ""}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, displayName: e.target.value }))
                    }
                    placeholder={decodeTokenName(token) || "专业人员"}
                  />
                  <span className="setting-hint">在通话中显示的姓名</span>
                </div>
                <div className="setting-row">
                  <label>仪表盘链接</label>
                  <div className="copy-link-row">
                    <input
                      type="text"
                      readOnly
                      value={dashboardUrl}
                      className="copy-input"
                    />
                    <button
                      type="button"
                      className="btn-copy"
                      onClick={() => {
                        navigator.clipboard.writeText(dashboardUrl)
                        setCopyFeedback(true)
                        setTimeout(() => setCopyFeedback(false), 2000)
                      }}
                    >
                      <i className="fa fa-copy"></i> {copyFeedback ? "已复制" : "复制"}
                    </button>
                  </div>
                  <span className="setting-hint">收藏此链接，下次直接打开仪表盘</span>
                </div>
                <div className="setting-row">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.soundOn ?? true}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, soundOn: e.target.checked }))
                      }
                    />
                    新呼叫时播放提示音
                  </label>
                  <span className="setting-hint">有客户发起通话时播放提醒（预留）</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default ProDashboard
