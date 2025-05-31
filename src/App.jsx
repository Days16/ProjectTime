import React, { useState, useEffect } from "react"
import Login from "./components/Login"
import Timer from "./components/Timer"
import ExportImportData from "./components/ExportImportData"

function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (stored) setUser(stored)
  }, [])

  return (
    <div className="app-container">
      {!user ? (
        <Login setUser={setUser} />
      ) : (
        <div className="logged-in-container">
          <Timer user={user} />
          <ExportImportData user={user} />
        </div>
      )}
    </div>
  )
}

export default App
