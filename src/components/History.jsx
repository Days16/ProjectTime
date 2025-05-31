import React, { useEffect, useState } from "react"

export default function History({ user, refresh }) {
  const [history, setHistory] = useState([])

  useEffect(() => {
    const allKeys = Object.keys(localStorage).filter(k =>
      k.startsWith(`worktime_${user}_`)
    )

    const data = allKeys.map(key => {
      const dateStr = key.split(`worktime_${user}_`)[1]
      const time = Number(localStorage.getItem(key))
      return { date: dateStr, time }
    })

    data.sort((a, b) => (a.date < b.date ? 1 : -1))

    setHistory(data)
  }, [user, refresh])

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, "0")
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, "0")
    const s = (secs % 60).toString().padStart(2, "0")
    return `${h}:${m}:${s}`
  }

  return (
    <div className="history-container">
      <h2 className="history-title">Historial de tiempos</h2>
      {history.length === 0 && <p>No hay registros todavía.</p>}
      <ul className="history-list">
        {history.map(({ date, time }) => (
          <li key={date} className="history-item">
            <span className="history-date">{date}</span>
            <span className="history-time">{formatTime(time)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
