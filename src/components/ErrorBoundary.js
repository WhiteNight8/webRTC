/**
 * 错误边界
 * 捕获子组件抛出的错误，避免整页白屏
 */
import { Component } from "react"

class ErrorBoundary extends Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary:", error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "2rem",
            textAlign: "center",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h2>页面出错</h2>
          <p style={{ color: "#666", margin: "1rem 0" }}>
            {this.state.error?.message || "未知错误"}
          </p>
          <button
            onClick={() => window.location.assign("/")}
            style={{
              padding: "10px 20px",
              background: "#705cf3",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            返回首页
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
