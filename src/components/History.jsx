import React, { useEffect, useState } from "react"
import { getUserHistory, updateHistoryEntry, deleteHistoryEntry, saveHistoryEntry } from "../database/firestoreService"
import { cacheService } from "../utils/cacheService"
import { exportService } from "../utils/exportService"
import { useTheme } from "../context/ThemeContext"
import { useNotification } from "./Notification"
import { useAuth } from "../context/AuthContext"
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../auth/firebase'

export default function History() {
  const { user } = useAuth()
  const { addNotification } = useNotification()
  const [history, setHistory] = useState([])
  const [filter, setFilter] = useState("")
  const [totalByProject, setTotalByProject] = useState({})
  const [editingEntry, setEditingEntry] = useState(null)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [newEntry, setNewEntry] = useState({
    project: "",
    date: new Date().toISOString().split("T")[0],
    seconds: 0
  })
  const [timeEntries, setTimeEntries] = useState([])
  const [isAddingEntry, setIsAddingEntry] = useState(false)

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  useEffect(() => {
    fetchHistory()
    if (user) {
      fetchTimeEntries()
    }
  }, [user])

  const fetchHistory = async () => {
    try {
      let data
      if (isOffline) {
        data = await cacheService.getHistory()
      } else {
        data = await getUserHistory(user.uid)
        await cacheService.saveHistory(data)
      }
      setHistory(data)

      const totals = {}
      for (const item of data) {
        const project = item.project || "Sin nombre"
        totals[project] = (totals[project] || 0) + item.seconds
      }
      setTotalByProject(totals)
    } catch (error) {
      console.error("Error al cargar el historial:", error)
      addNotification("Error al cargar el historial", "error")
    }
  }

  const fetchTimeEntries = async () => {
    try {
      const entriesRef = collection(db, 'timeEntries')
      const q = query(
        entriesRef,
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc')
      )
      const querySnapshot = await getDocs(q)
      const entries = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
      }))
      setTimeEntries(entries)
    } catch (error) {
      console.error('Error al cargar entradas:', error)
    }
  }

  const handleAddEntry = async () => {
    if (!newEntry.project.trim()) {
      addNotification("Por favor, ingresa un nombre de proyecto", "error")
      return
    }

    try {
      if (isOffline) {
        await cacheService.addToSyncQueue({
          type: "add",
          data: newEntry
        })
        await cacheService.saveHistory([...history, { ...newEntry, id: Date.now() }])
        addNotification("Registro guardado localmente", "info")
      } else {
        await saveHistoryEntry(user.uid, newEntry)
        addNotification("Registro guardado exitosamente", "success")
      }
      
      setNewEntry({
        project: "",
        date: new Date().toISOString().split("T")[0],
        seconds: 0
      })
      fetchHistory()
    } catch (error) {
      console.error("Error al guardar:", error)
      addNotification("Error al guardar el registro", "error")
    }
  }

  const handleUpdateEntry = async (id) => {
    try {
      if (isOffline) {
        await cacheService.addToSyncQueue({
          type: "update",
          id,
          data: editingEntry
        })
        const updatedHistory = history.map(item =>
          item.id === id ? editingEntry : item
        )
        await cacheService.saveHistory(updatedHistory)
        addNotification("Registro actualizado localmente", "info")
      } else {
        await updateHistoryEntry(user.uid, id, editingEntry)
        addNotification("Registro actualizado exitosamente", "success")
      }
      
      setEditingEntry(null)
      fetchHistory()
    } catch (error) {
      console.error("Error al actualizar:", error)
      addNotification("Error al actualizar el registro", "error")
    }
  }

  const handleDeleteEntry = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este registro?")) {
      try {
        if (isOffline) {
          await cacheService.addToSyncQueue({
            type: "delete",
            id
          })
          const updatedHistory = history.filter(item => item.id !== id)
          await cacheService.saveHistory(updatedHistory)
          addNotification("Registro eliminado localmente", "info")
        } else {
          await deleteHistoryEntry(user.uid, id)
          addNotification("Registro eliminado exitosamente", "success")
        }
        
        fetchHistory()
      } catch (error) {
        console.error("Error al eliminar:", error)
        addNotification("Error al eliminar el registro", "error")
      }
    }
  }

  const handleExport = async (format) => {
    try {
      if (format === "pdf") {
        await exportService.exportToPDF(history, "Historial de Horas")
        addNotification("Exportación a PDF completada", "success")
      } else if (format === "excel") {
        await exportService.exportToExcel(history, "Historial de Horas")
        addNotification("Exportación a Excel completada", "success")
      }
    } catch (error) {
      console.error("Error al exportar:", error)
      addNotification("Error al exportar los datos", "error")
    }
  }

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, "0")
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0")
    const s = (seconds % 60).toString().padStart(2, "0")
    return `${h}:${m}:${s}`
  }

  const parseTimeToSeconds = (timeStr) => {
    const [h, m, s] = timeStr.split(":").map(Number)
    return h * 3600 + m * 60 + s
  }

  const filteredHistory = filter
    ? history.filter((item) =>
        item.project?.toLowerCase().includes(filter.toLowerCase())
      )
    : history

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <div className="page-container">
      <div className="content-container">
        <div className="history-container">
          <div className="flex justify-between items-center mb-8">
            <h1 className="history-title">Historial de Tiempo</h1>
            <button
              onClick={() => setIsAddingEntry(true)}
              className="btn"
            >
              Registrar Tiempo
            </button>
          </div>

          {isAddingEntry && (
            <div className="bg-[#2a2a2a] p-6 rounded-xl mb-8">
              <h2 className="text-2xl text-[#00ffff] mb-4">Registrar Nuevo Tiempo</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Proyecto"
                  value={newEntry.project}
                  onChange={(e) => setNewEntry({ ...newEntry, project: e.target.value })}
                  className="history-input"
                />
                <input
                  type="text"
                  placeholder="Descripción"
                  value={newEntry.description}
                  onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                  className="history-input"
                />
                <div className="flex gap-4">
                  <input
                    type="number"
                    placeholder="Horas"
                    value={newEntry.hours}
                    onChange={(e) => setNewEntry({ ...newEntry, hours: e.target.value })}
                    className="history-input"
                    min="0"
                  />
                  <input
                    type="number"
                    placeholder="Minutos"
                    value={newEntry.minutes}
                    onChange={(e) => setNewEntry({ ...newEntry, minutes: e.target.value })}
                    className="history-input"
                    min="0"
                    max="59"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setIsAddingEntry(false)}
                  className="btn-cancel"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddEntry}
                  className="btn-success"
                >
                  Guardar
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-4xl bg-gradient-to-r from-[#00c6ff] to-[#0072ff] bg-clip-text text-transparent">Gestión de Horas por Proyecto</h2>
            <div className="space-x-2">
              <button
                onClick={() => handleExport("pdf")}
                className="bg-[#2a2a2a] text-[#00c6ff] border border-[#00c6ff] px-4 py-2 rounded-xl hover:bg-[#00c6ff] hover:text-[#1a1a1a] transition-all duration-300"
              >
                Exportar PDF
              </button>
              <button
                onClick={() => handleExport("excel")}
                className="bg-[#2a2a2a] text-[#00c6ff] border border-[#00c6ff] px-4 py-2 rounded-xl hover:bg-[#00c6ff] hover:text-[#1a1a1a] transition-all duration-300"
              >
                Exportar Excel
              </button>
            </div>
          </div>

          {isOffline && (
            <div className="bg-yellow-500 text-white p-4 rounded-xl mb-4">
              Estás trabajando en modo offline. Los cambios se sincronizarán cuando vuelvas a estar en línea.
            </div>
          )}

          <div className="mb-6">
            <input
              type="text"
              className="w-full p-3 border border-[#333] rounded-xl mb-8 text-base bg-[#2a2a2a] text-white transition-all duration-300 focus:outline-none focus:border-[#00c6ff] focus:shadow-[0_0_0_2px_rgba(0,198,255,0.2)]"
              placeholder="🔍 Buscar proyecto..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-6">
            {timeEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-[#2a2a2a] p-6 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.2)] hover:shadow-[0_0_20px_rgba(0,255,255,0.1)] transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{entry.project}</h3>
                    <p className="text-gray-400 mt-1">{entry.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#00ffff] font-medium">{formatDuration(entry.totalMinutes)}</p>
                    <p className="text-gray-500 text-sm">{formatDate(entry.timestamp)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
