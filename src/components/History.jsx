import React, { useEffect, useState } from "react"
import { getUserHistory, updateHistoryEntry, deleteHistoryEntry, saveHistoryEntry } from "../database/firestoreService"
import { cacheService } from "../utils/cacheService"
import { exportService } from "../utils/exportService"
import { useTheme } from "../context/ThemeContext"
import { useNotification } from "./Notification"
import { useAuth } from "../context/AuthContext"

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

  return (
    <div className="page-container">
      <div className="content-container">
    <div className="history-container">
          <h1 className="history-title">Historial de Tiempo</h1>
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

          <div className="bg-[#2a2a2a] p-6 rounded-xl mb-8 shadow-[0_0_15px_rgba(0,0,0,0.2)]">
            <h3 className="text-xl font-semibold mb-4 text-[#00c6ff]">Añadir Nuevo Registro</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Nombre del proyecto"
                value={newEntry.project}
                onChange={(e) => setNewEntry({ ...newEntry, project: e.target.value })}
                className="bg-[#333] border border-[#444] text-white p-3 rounded-lg text-base transition-all duration-300 focus:outline-none focus:border-[#00c6ff] focus:shadow-[0_0_0_2px_rgba(0,198,255,0.2)]"
              />
              <input
                type="date"
                value={newEntry.date}
                onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                className="bg-[#333] border border-[#444] text-white p-3 rounded-lg text-base transition-all duration-300 focus:outline-none focus:border-[#00c6ff] focus:shadow-[0_0_0_2px_rgba(0,198,255,0.2)]"
              />
              <input
                type="text"
                placeholder="HH:MM:SS"
                value={formatTime(newEntry.seconds)}
                onChange={(e) => {
                  const seconds = parseTimeToSeconds(e.target.value)
                  if (!isNaN(seconds)) {
                    setNewEntry({ ...newEntry, seconds })
                  }
                }}
                className="bg-[#333] border border-[#444] text-white p-3 rounded-lg text-base transition-all duration-300 focus:outline-none focus:border-[#00c6ff] focus:shadow-[0_0_0_2px_rgba(0,198,255,0.2)]"
              />
              <button
                onClick={handleAddEntry}
                className="bg-[#2a2a2a] text-[#00c6ff] border border-[#00c6ff] px-4 py-2 rounded-xl hover:bg-[#00c6ff] hover:text-[#1a1a1a] transition-all duration-300"
              >
                Añadir
              </button>
            </div>
          </div>

          <div className="mb-6">
      <input
        type="text"
              className="w-full p-3 border border-[#333] rounded-xl mb-8 text-base bg-[#2a2a2a] text-white transition-all duration-300 focus:outline-none focus:border-[#00c6ff] focus:shadow-[0_0_0_2px_rgba(0,198,255,0.2)]"
              placeholder="🔍 Buscar proyecto..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#2a2a2a] p-6 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.2)]">
              <h3 className="text-xl font-semibold mb-4 text-[#00c6ff]">Registros Recientes</h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {filteredHistory.map((item) => (
                  <div key={item.id} className="bg-[#333] p-4 rounded-lg mb-3 shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-all duration-200 hover:bg-[#3a3a3a] hover:-translate-y-0.5">
                    {editingEntry?.id === item.id ? (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <input
                          type="text"
                          value={editingEntry.project}
                          onChange={(e) =>
                            setEditingEntry({ ...editingEntry, project: e.target.value })
                          }
                          className="bg-[#333] border border-[#444] text-white p-3 rounded-lg text-base transition-all duration-300 focus:outline-none focus:border-[#00c6ff] focus:shadow-[0_0_0_2px_rgba(0,198,255,0.2)]"
                        />
                        <input
                          type="date"
                          value={editingEntry.date}
                          onChange={(e) =>
                            setEditingEntry({ ...editingEntry, date: e.target.value })
                          }
                          className="bg-[#333] border border-[#444] text-white p-3 rounded-lg text-base transition-all duration-300 focus:outline-none focus:border-[#00c6ff] focus:shadow-[0_0_0_2px_rgba(0,198,255,0.2)]"
                        />
                        <input
                          type="text"
                          value={formatTime(editingEntry.seconds)}
                          onChange={(e) => {
                            const seconds = parseTimeToSeconds(e.target.value)
                            if (!isNaN(seconds)) {
                              setEditingEntry({ ...editingEntry, seconds })
                            }
                          }}
                          className="bg-[#333] border border-[#444] text-white p-3 rounded-lg text-base transition-all duration-300 focus:outline-none focus:border-[#00c6ff] focus:shadow-[0_0_0_2px_rgba(0,198,255,0.2)]"
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleUpdateEntry(item.id)}
                            className="bg-[#2a2a2a] text-[#00c6ff] border border-[#00c6ff] px-4 py-2 rounded-xl hover:bg-[#00c6ff] hover:text-[#1a1a1a] transition-all duration-300"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => setEditingEntry(null)}
                            className="bg-[#2a2a2a] text-gray-400 border border-gray-400 px-4 py-2 rounded-xl hover:bg-gray-400 hover:text-[#1a1a1a] transition-all duration-300"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold text-white">{item.project}</h4>
                          <p className="text-sm text-gray-400">{item.date}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="font-['Courier_New'] text-[#00c6ff] font-medium">{formatTime(item.seconds)}</span>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingEntry(item)}
                              className="bg-[#2a2a2a] text-[#00c6ff] border border-[#00c6ff] px-4 py-2 rounded-xl hover:bg-[#00c6ff] hover:text-[#1a1a1a] transition-all duration-300"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteEntry(item.id)}
                              className="bg-[#2a2a2a] text-[#ff4444] border border-[#ff4444] px-4 py-2 rounded-xl hover:bg-[#ff4444] hover:text-white transition-all duration-300"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#2a2a2a] p-6 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.2)]">
              <h3 className="text-xl font-semibold mb-4 text-[#00c6ff]">Resumen por Proyecto</h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {Object.entries(totalByProject)
                  .sort(([, a], [, b]) => b - a)
                  .map(([project, seconds]) => (
                    <div
                      key={project}
                      className="bg-[#333] p-4 rounded-lg flex justify-between items-center"
                    >
                      <span className="font-semibold text-white">{project}</span>
                      <span className="font-['Courier_New'] text-[#00c6ff] font-medium">{formatTime(seconds)}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
