/**
 * 聊天窗口组件
 * 通过 Socket 在视频通话中发送和接收文本消息
 */

import { useState, useEffect, useRef } from "react"

const ChatWindow = ({ callUuid, socket, isOpen, onToggle }) => {
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState("")
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!socket?.on || !callUuid) return
    const onMessage = ({ from, text }) => {
      setMessages((prev) => [...prev, { from, text, isOwn: false }])
    }
    socket.on("chatMessage", onMessage)
    return () => socket.off("chatMessage", onMessage)
  }, [socket, callUuid])

  const sendMessage = () => {
    const text = inputText.trim()
    if (!text || !socket?.emit || !callUuid) return
    socket.emit("chatMessage", {
      uuid: callUuid,
      from: "me",
      text,
    })
    setMessages((prev) => [...prev, { from: "me", text, isOwn: true }])
    setInputText("")
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className={`chat-window ${isOpen ? "open" : ""}`}>
      <div
        className="chat-header"
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onToggle()}
      >
        <h3>聊天</h3>
        <i className={`fa fa-chevron-${isOpen ? "left" : "right"}`}></i>
      </div>
      {isOpen && (
        <>
          <div className="chat-messages">
            {messages.length === 0 ? (
              <p className="chat-placeholder">暂无消息，开始聊天吧</p>
            ) : (
              messages.map((m, i) => (
                <div
                  key={i}
                  className={`chat-msg ${m.isOwn ? "own" : ""}`}
                >
                  <span className="chat-from">{m.from === "me" ? "我" : "对方"}:</span>
                  <span className="chat-text">{m.text}</span>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="chat-input-row">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入消息..."
            />
            <button type="button" onClick={sendMessage}>
              发送
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default ChatWindow
