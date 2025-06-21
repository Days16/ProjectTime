import React, { createContext, useContext, useState, useRef } from "react"

const NotificationContext = createContext()

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotification debe ser usado dentro de un NotificationProvider")
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])
  const idCounter = useRef(0)

  const addNotification = (message, type = "info") => {
    const id = `${Date.now()}-${idCounter.current++}`
    setNotifications((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      removeNotification(id)
    }, 5000)
  }

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  const getNotificationStyle = (type) => {
    switch (type) {
      case "success":
        return "bg-[#00c6ff] border-[#00c6ff]"
      case "error":
        return "bg-[#ff4444] border-[#ff4444]"
      default:
        return "bg-[#2a2a2a] border-[#00c6ff]"
    }
  }

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.2)] transform transition-all duration-300 border ${getNotificationStyle(notification.type)} text-white`}
          >
            {notification.message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  )
} 