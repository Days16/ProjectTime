import { useState, useEffect } from "react"

const formatTime = (seconds) => {
  const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0')
  const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')
  const secs = String(seconds % 60).padStart(2, '0')
  return `${hrs}:${mins}:${secs}`
}

export default function Timer() {
  const [seconds, setSeconds] = useState(() => {
    return Number(localStorage.getItem("time")) || 0
  })
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    let interval
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          const newTime = prev + 1
          localStorage.setItem("time", newTime)
          return newTime
        })
      }, 1000)
    } else if (!isRunning && seconds !== 0) {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [isRunning])

  const handleStart = () => setIsRunning(true)
  const handlePause = () => setIsRunning(false)
  const handleReset = () => {
    setIsRunning(false)
    setSeconds(0)
    localStorage.removeItem("time")
  }

  return (
    <div className="bg-primary p-8 rounded-2xl shadow-lg max-w-md mx-auto text-center">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-gradientStart to-gradientEnd bg-clip-text text-transparent mb-6">
        Asistencia Diaria
      </h1>
      <p className="text-5xl font-mono mb-6">{formatTime(seconds)}</p>
      <div className="flex justify-center gap-4">
        <button
          onClick={handleStart}
          className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 transition"
        >
          Iniciar
        </button>
        <button
          onClick={handlePause}
          className="px-4 py-2 rounded-xl bg-yellow-600 hover:bg-yellow-700 transition"
        >
          Pausar
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 transition"
        >
          Detener
        </button>
      </div>
    </div>
  )
}
