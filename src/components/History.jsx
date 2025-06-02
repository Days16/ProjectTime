import React, { useEffect, useState } from "react"
import { getUserHistory } from "./database/firestoreService"

export default function History({ user }) {
  const [history, setHistory] = useState([])

  useEffect(() => {
    const fetch = async () => {
      const data = await getUserHistory(user.uid)
      setHistory(data)
    }
    fetch()
  }, [user])

  return (
    <div className="history-container">
      <h2 className="history-title">Historial de sesiones</h2>
      <ul className="history-list">
        {history.map((item) => (
          <li key={item.id}>
            {item.date} - {item.seconds} segundos
          </li>
        ))}
      </ul>
    </div>
  )
}