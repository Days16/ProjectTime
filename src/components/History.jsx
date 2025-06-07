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
  deleteDoc,
  doc,
  updateDoc,
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
    description: "",
    hours: "",
    minutes: "",
  })
  const [timeEntries, setTimeEntries] = useState([])
  const [isAddingEntry, setIsAddingEntry] = useState(false)
  const [groupedEntries, setGroupedEntries] = useState({})
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

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

  useEffect(() => {
    if (timeEntries.length > 0) {
      const grouped = timeEntries.reduce((acc, entry) => {
        if (!acc[entry.project]) {
          acc[entry.project] = {
            totalMinutes: 0,
            entries: [],
            lastUpdated: null
          };
        }
        acc[entry.project].totalMinutes += entry.totalMinutes;
        acc[entry.project].entries.push(entry);
        if (!acc[entry.project].lastUpdated || entry.timestamp > acc[entry.project].lastUpdated) {
          acc[entry.project].lastUpdated = entry.timestamp;
        }
        return acc;
      }, {});
      setGroupedEntries(grouped);
    } else {
      setGroupedEntries({});
    }
    setIsLoading(false);
  }, [timeEntries]);

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
      setIsLoading(true);
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
      console.log('Entradas cargadas:', entries); // Debug
      setTimeEntries(entries)
    } catch (error) {
      console.error('Error al cargar entradas:', error)
    } finally {
      setIsLoading(false);
    }
  }

  const handleAddEntry = async () => {
    if (!newEntry.project || !newEntry.hours || !newEntry.minutes) return;

    try {
      setIsLoading(true);
      const totalMinutes = (parseInt(newEntry.hours) * 60) + parseInt(newEntry.minutes);
      const entryData = {
        userId: user.uid,
        project: newEntry.project,
        description: newEntry.description,
        totalMinutes,
        timestamp: serverTimestamp(),
      };

      await addDoc(collection(db, 'timeEntries'), entryData);
      setNewEntry({ project: '', description: '', hours: '', minutes: '' });
      setIsAddingEntry(false);
      await fetchTimeEntries(); // Esperar a que se actualicen los datos
    } catch (error) {
      console.error('Error al añadir entrada:', error);
    } finally {
      setIsLoading(false);
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

  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este registro?')) return;

    try {
      setIsDeleting(true);
      await deleteDoc(doc(db, 'timeEntries', entryId));
      await fetchTimeEntries(); // Esperar a que se actualicen los datos
    } catch (error) {
      console.error('Error al eliminar entrada:', error);
    } finally {
      setIsDeleting(false);
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
    if (!date) return 'Fecha no disponible';
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const formatDuration = (minutes) => {
    if (!minutes) return '0h 0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  const handleDeleteProject = async (project) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar todos los registros del proyecto "${project}"?`)) return;

    try {
      setIsDeleting(true);
      const entriesToDelete = groupedEntries[project].entries;
      const deletePromises = entriesToDelete.map(entry => 
        deleteDoc(doc(db, 'timeEntries', entry.id))
      );
      await Promise.all(deletePromises);
      await fetchTimeEntries(); // Esperar a que se actualicen los datos
    } catch (error) {
      console.error('Error al eliminar proyecto:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditEntry = async (entryId, newDescription) => {
    try {
      setIsLoading(true);
      const entryRef = doc(db, 'timeEntries', entryId);
      await updateDoc(entryRef, {
        description: newDescription,
      });
      await fetchTimeEntries();
      setEditingEntry(null);
    } catch (error) {
      console.error('Error al editar entrada:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="history-container">
            <div className="flex justify-center items-center h-64">
              <p className="text-[#00ffff]">Cargando datos...</p>
            </div>
          </div>
        </div>
      </div>
    );
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
              disabled={isDeleting || isLoading}
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
                  disabled={isDeleting || isLoading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddEntry}
                  className="btn-success"
                  disabled={isDeleting || isLoading}
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

          {Object.keys(groupedEntries).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No hay registros de tiempo. ¡Añade tu primer registro!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {Object.entries(groupedEntries)
                .sort(([, a], [, b]) => b.lastUpdated - a.lastUpdated)
                .map(([project, data]) => (
                  <div
                    key={project}
                    className="bg-[#2a2a2a] p-6 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.2)] hover:shadow-[0_0_20px_rgba(0,255,255,0.1)] transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-semibold text-white">{project}</h3>
                          <button
                            onClick={() => handleDeleteProject(project)}
                            className="text-red-500 hover:text-red-400 transition-colors"
                            disabled={isDeleting || isLoading}
                            title="Eliminar proyecto"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-gray-400 mt-1">
                          {data.entries.length} {data.entries.length === 1 ? 'registro' : 'registros'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[#00ffff] font-medium text-lg">
                          Total: {formatDuration(data.totalMinutes)}
                        </p>
                        <p className="text-gray-500 text-sm">
                          Último registro: {formatDate(data.lastUpdated)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      {data.entries.map((entry) => (
                        <div
                          key={entry.id}
                          className="bg-[#333] p-3 rounded-lg flex justify-between items-center"
                        >
                          <div className="flex-1">
                            {editingEntry === entry.id ? (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={entry.description}
                                  onChange={(e) => {
                                    const updatedEntries = timeEntries.map(t => 
                                      t.id === entry.id ? { ...t, description: e.target.value } : t
                                    );
                                    setTimeEntries(updatedEntries);
                                  }}
                                  className="history-input flex-1"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleEditEntry(entry.id, entry.description)}
                                  className="text-[#00ffff] hover:text-[#00cccc] transition-colors"
                                  disabled={isDeleting || isLoading}
                                  title="Guardar cambios"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingEntry(null);
                                    fetchTimeEntries();
                                  }}
                                  className="text-red-500 hover:text-red-400 transition-colors"
                                  disabled={isDeleting || isLoading}
                                  title="Cancelar edición"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <p className="text-gray-400">{entry.description || 'Sin descripción'}</p>
                                <button
                                  onClick={() => setEditingEntry(entry.id)}
                                  className="text-[#00ffff] hover:text-[#00cccc] transition-colors"
                                  disabled={isDeleting || isLoading}
                                  title="Editar descripción"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-[#00ffff]">{formatDuration(entry.totalMinutes)}</p>
                              <p className="text-gray-500 text-sm">{formatDate(entry.timestamp)}</p>
                            </div>
                            <button
                              onClick={() => handleDeleteEntry(entry.id)}
                              className="text-red-500 hover:text-red-400 transition-colors"
                              disabled={isDeleting || isLoading}
                              title="Eliminar registro"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
