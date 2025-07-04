import React, { useEffect, useState, useCallback } from "react"
import { getUserHistory, updateHistoryEntry } from "../database/firestoreService"
import { cacheService } from "../utils/cacheService"
import { exportService } from "../utils/exportService"
import { useNotification } from "../components/Notification"
import { useAuth } from "../context/AuthContext"
import SearchAndFilters from "../components/SearchAndFilters"
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
import { db } from '../config/firebase'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { filterData } from '../utils/chartDataUtils'

export default function HourManagementPage() {
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
  const [filters, setFilters] = useState({})
  const [filteredTimeEntries, setFilteredTimeEntries] = useState([])

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
    // Aplicar filtros a las entradas de tiempo
    const filtered = filterData(timeEntries, filters);
    setFilteredTimeEntries(filtered);
    
    if (filtered.length > 0) {
      const grouped = filtered.reduce((acc, entry) => {
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
  }, [timeEntries, filters]);

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
      setTimeEntries(entries)
    } catch (error) {
      console.error('Error al cargar entradas:', error)
    } finally {
      setIsLoading(false);
    }
  }

  const validateNewEntry = () => {
    if (!newEntry.project.trim()) {
      addNotification("Por favor, ingresa el nombre del proyecto", "error");
      return false;
    }
    
    if (newEntry.project.trim().length < 3) {
      addNotification("El nombre del proyecto debe tener al menos 3 caracteres", "error");
      return false;
    }
    
    if (newEntry.project.trim().length > 100) {
      addNotification("El nombre del proyecto no puede exceder 100 caracteres", "error");
      return false;
    }
    
    if (!newEntry.hours || !newEntry.minutes) {
      addNotification("Por favor, ingresa las horas y minutos", "error");
      return false;
    }
    
    const hours = parseInt(newEntry.hours);
    const minutes = parseInt(newEntry.minutes);
    
    if (isNaN(hours) || hours < 0) {
      addNotification("Las horas deben ser un número válido mayor o igual a 0", "error");
      return false;
    }
    
    if (isNaN(minutes) || minutes < 0 || minutes > 59) {
      addNotification("Los minutos deben ser un número entre 0 y 59", "error");
      return false;
    }
    
    if (hours === 0 && minutes === 0) {
      addNotification("El tiempo registrado debe ser mayor a 0", "error");
      return false;
    }
    
    return true;
  };

  const handleAddEntry = async () => {
    if (!validateNewEntry()) {
      return;
    }

    try {
      setIsLoading(true);
      const totalMinutes = (parseInt(newEntry.hours) * 60) + parseInt(newEntry.minutes);
      const entryData = {
        userId: user.uid,
        project: newEntry.project.trim(),
        description: newEntry.description.trim(),
        totalMinutes,
        timestamp: serverTimestamp(),
      };

      await addDoc(collection(db, 'timeEntries'), entryData);
      setNewEntry({ project: '', description: '', hours: '', minutes: '' });
      setIsAddingEntry(false);
      await fetchTimeEntries(); // Esperar a que se actualicen los datos
      addNotification("Tiempo registrado exitosamente", "success");
    } catch (error) {
      console.error('Error al añadir entrada:', error);
      addNotification("Error al registrar el tiempo", "error");
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
    if (!window.confirm('¿Estás seguro de que quieres eliminar este registro? Esta acción no se puede deshacer.')) return;

    try {
      setIsDeleting(true);
      await deleteDoc(doc(db, 'timeEntries', entryId));
      await fetchTimeEntries(); // Esperar a que se actualicen los datos
      addNotification("Registro eliminado exitosamente", "success");
    } catch (error) {
      console.error('Error al eliminar entrada:', error);
      addNotification("Error al eliminar el registro", "error");
    } finally {
      setIsDeleting(false);
    }
  }

  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const parseTimeToSeconds = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number)
    return (hours * 3600) + (minutes * 60)
  }

  const formatDate = (date) => {
    if (!date) return 'Fecha no disponible'
    const d = date instanceof Date ? date : date.toDate()
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  const handleDeleteProject = async (project) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar el proyecto "${project}" y todos sus registros? Esta acción no se puede deshacer.`)) return;

    try {
      setIsDeleting(true);
      
      // Obtener todas las entradas del proyecto
      const entriesRef = collection(db, 'timeEntries');
      const q = query(
        entriesRef,
        where('userId', '==', user.uid),
        where('project', '==', project)
      );
      
      const querySnapshot = await getDocs(q);
      
      // Eliminar todas las entradas del proyecto
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      await fetchTimeEntries();
      addNotification(`Proyecto "${project}" eliminado exitosamente`, "success");
    } catch (error) {
      console.error('Error al eliminar proyecto:', error);
      addNotification("Error al eliminar el proyecto", "error");
    } finally {
      setIsDeleting(false);
    }
  }

  const handleEditEntry = async (entryId, newDescription) => {
    if (!newDescription.trim()) {
      addNotification("La descripción no puede estar vacía", "error");
      return;
    }
    
    if (newDescription.trim().length > 500) {
      addNotification("La descripción no puede exceder 500 caracteres", "error");
      return;
    }

    try {
      await updateDoc(doc(db, 'timeEntries', entryId), {
        description: newDescription.trim()
      });
      await fetchTimeEntries();
      setEditingEntry(null);
      addNotification("Descripción actualizada exitosamente", "success");
    } catch (error) {
      console.error('Error al editar entrada:', error);
      addNotification("Error al actualizar la descripción", "error");
    }
  }

  const exportToPDF = () => {
    if (Object.keys(groupedEntries).length === 0) {
      addNotification("No hay datos para exportar", "error");
      return;
    }

    try {
      const doc = new jsPDF();
      
      // Título
      doc.setFontSize(20);
      doc.text('Reporte de Tiempo por Proyecto', 20, 20);
      
      let yPosition = 40;
      
      Object.entries(groupedEntries).forEach(([project, data]) => {
        // Nombre del proyecto
        doc.setFontSize(14);
        doc.text(project, 20, yPosition);
        yPosition += 10;
        
        // Total de tiempo
        doc.setFontSize(12);
        doc.text(`Total: ${formatDuration(data.totalMinutes)}`, 20, yPosition);
        yPosition += 10;
        
        // Registros individuales
        doc.setFontSize(10);
        data.entries.forEach(entry => {
          const description = entry.description || 'Sin descripción';
          const time = formatDuration(entry.totalMinutes);
          const date = formatDate(entry.timestamp);
          
          doc.text(`${date} - ${time} - ${description}`, 30, yPosition);
          yPosition += 7;
        });
        
        yPosition += 10;
        
        // Nueva página si es necesario
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
      });
      
      doc.save('reporte-tiempo.pdf');
      addNotification("Reporte PDF exportado exitosamente", "success");
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      addNotification("Error al exportar el PDF", "error");
    }
  }

  const exportToExcel = () => {
    if (Object.keys(groupedEntries).length === 0) {
      addNotification("No hay datos para exportar", "error");
      return;
    }

    try {
      const workbook = XLSX.utils.book_new();
      
      // Crear datos para la hoja de resumen
      const summaryData = [
        ['Proyecto', 'Total Horas', 'Total Minutos', 'Número de Registros']
      ];
      
      Object.entries(groupedEntries).forEach(([project, data]) => {
        const totalHours = Math.floor(data.totalMinutes / 60);
        const totalMinutes = data.totalMinutes % 60;
        summaryData.push([
          project,
          totalHours,
          totalMinutes,
          data.entries.length
        ]);
      });
      
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');
      
      // Crear datos para la hoja de detalles
      const detailData = [
        ['Proyecto', 'Fecha', 'Tiempo (minutos)', 'Descripción']
      ];
      
      Object.entries(groupedEntries).forEach(([project, data]) => {
        data.entries.forEach(entry => {
          detailData.push([
            project,
            formatDate(entry.timestamp),
            entry.totalMinutes,
            entry.description || 'Sin descripción'
          ]);
        });
      });
      
      const detailSheet = XLSX.utils.aoa_to_sheet(detailData);
      XLSX.utils.book_append_sheet(workbook, detailSheet, 'Detalles');
      
      XLSX.writeFile(workbook, 'reporte-tiempo.xlsx');
      addNotification("Reporte Excel exportado exitosamente", "success");
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      addNotification("Error al exportar el Excel", "error");
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen text-white">Cargando...</div>;
  }

  return (
    <div className="page-container">
      <div className="content-container">
    <div className="history-container">
          <div className="flex justify-between items-center mb-8">
            <h1 className="history-title">Historial de Tiempo</h1>
            <div className="flex gap-4">
              <button
                onClick={exportToPDF}
                className="btn-secondary"
                disabled={isDeleting || isLoading || Object.keys(groupedEntries).length === 0}
                title="Exportar a PDF"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                </svg>
                PDF
              </button>
              <button
                onClick={exportToExcel}
                className="btn-secondary"
                disabled={isDeleting || isLoading || Object.keys(groupedEntries).length === 0}
                title="Exportar a Excel"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                Excel
              </button>
              <button
                onClick={() => setIsAddingEntry(true)}
                className="btn"
                disabled={isDeleting || isLoading}
              >
                Registrar Tiempo
              </button>
            </div>
          </div>

          {/* Filtros avanzados */}
          <SearchAndFilters
            onFiltersChange={handleFiltersChange}
            projects={timeEntries.map(entry => ({ project: entry.project }))}
            showDateFilter={true}
            showProjectFilter={true}
            showStatusFilter={false}
            showTimeFilter={true}
            placeholder="Buscar en proyectos y descripciones..."
          />

          {isAddingEntry && (
            <div className="bg-[#2a2a2a] p-6 rounded-xl mb-8">
              <h2 className="text-2xl text-[#00ffff] mb-4">Registrar Nuevo Tiempo</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Nombre del proyecto (mín. 3 caracteres)"
                  value={newEntry.project}
                  onChange={(e) => setNewEntry({ ...newEntry, project: e.target.value })}
                  className="history-input"
                  disabled={isLoading}
                  maxLength={100}
                />
                <input
                  type="text"
                  placeholder="Descripción (opcional)"
                  value={newEntry.description}
                  onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                  className="history-input"
                  disabled={isLoading}
                  maxLength={500}
                />
                <div className="flex gap-4">
                  <input
                    type="number"
                    placeholder="Horas"
                    value={newEntry.hours}
                    onChange={(e) => setNewEntry({ ...newEntry, hours: e.target.value })}
                    className="history-input"
                    min="0"
                    max="999"
                    disabled={isLoading}
                  />
                  <input
                    type="number"
                    placeholder="Minutos"
                    value={newEntry.minutes}
                    onChange={(e) => setNewEntry({ ...newEntry, minutes: e.target.value })}
                    className="history-input"
                    min="0"
                    max="59"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => {
                    setIsAddingEntry(false);
                    setNewEntry({ project: '', description: '', hours: '', minutes: '' });
                  }}
                  className="btn-cancel"
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddEntry}
                  className="btn-success"
                  disabled={isLoading}
                >
                  {isLoading ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-4xl bg-gradient-to-r from-[#00c6ff] to-[#0072ff] bg-clip-text text-transparent">Gestión de Horas por Proyecto</h2>
          </div>

          {isOffline && (
            <div className="bg-yellow-500 text-white p-4 rounded-xl mb-4">
              Estás trabajando en modo offline. Los cambios se sincronizarán cuando vuelvas a estar en línea.
            </div>
          )}

          {Object.keys(groupedEntries).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">
                {filteredTimeEntries.length === 0 && timeEntries.length > 0 
                  ? "No hay registros que coincidan con los filtros aplicados." 
                  : "No hay registros de tiempo. ¡Añade tu primer registro!"}
              </p>
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
