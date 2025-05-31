import React, { useState, useEffect } from "react"
import Login from "./components/Login"
import Timer from "./components/Timer"
import ExportImportData from "./components/ExportImportData"
import History from "./components/History"

function App() {
  const [user, setUser] = useState(null)
  const [refreshHistory, setRefreshHistory] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (stored) setUser(stored)
  }, [])

  return (
    <div className="app-container">
      {!user ? (
        <div className="login-container">
          <Login setUser={setUser} />
        </div>
      ) : (
        <div className="logged-in-container">
          <Timer user={user} onStop={() => setRefreshHistory(prev => !prev)} />
          <History user={user} refresh={refreshHistory} />
          <ExportImportData user={user} />
        </div>
      )}
    </div>
  )
}

export default App
