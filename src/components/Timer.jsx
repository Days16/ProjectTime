import React, { useState, useEffect } from "react"

export default function Timer({ user }) {
  const [startTime, setStartTime] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    let interval = null
    if (isRunning) {
      interval = setInterval(() => {
        setElapsed((prev) => prev + 1)
      }, 1000)
    } else if (!isRunning && interval) {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [isRunning])

  const handleStart = () => {
    if (!isRunning) {
      setIsRunning(true)
      setStartTime(Date.now())
    }
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleStop = () => {
    setIsRunning(false)
    const currentDate = new Date().toISOString().split("T")[0]
    const key = `worktime_${user}_${currentDate}`
    const prev = Number(localStorage.getItem(key)) || 0
    localStorage.setItem(key, String(prev + elapsed))
    setElapsed(0)
  }

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, "0")
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, "0")
    const s = (secs % 60).toString().padStart(2, "0")
    return `${h}:${m}:${s}`
  }

  return (
    <div className="timer-container">
      <h1 className="timer-title">Temporizador</h1>
      <div className="time-display">{formatTime(elapsed)}</div>
      <div className="button-group">
        <button onClick={handleStart}>Iniciar</button>
        <button onClick={handlePause}>Pausar</button>
        <button onClick={handleStop}>Detener</button>
      </div>
    </div>
  )
}
