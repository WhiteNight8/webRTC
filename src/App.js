/**
 * 应用根组件
 * 配置路由：首页、客户视频页、专业人员仪表盘、专业人员视频页
 */
import { BrowserRouter, Routes, Route } from "react-router-dom"
import "./App.css"
import MainVideoPage from "./videoComponents/MainVideoPage"
import ProDashboard from "./siteComponents/ProDashboard"

const Home = () => (
  <div style={{ padding: "2rem", textAlign: "center" }}>
    <h1>Telelegal 视频通话</h1>
    <p>请使用预约链接或专业人员链接进入</p>
  </div>
)

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/join-video" element={<MainVideoPage />} />
        <Route path="/join-video-pro" element={<MainVideoPage />} />
        <Route path="/dashboard" element={<ProDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
