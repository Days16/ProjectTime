import React, { useState, useEffect, useCallback } from "react";
import { auth, db } from "../config/firebase";
import { collection, addDoc, query, where, getDocs, orderBy, deleteDoc, doc, updateDoc, writeBatch } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNotification } from "../components/Notification";
import SearchAndFilters from "../components/SearchAndFilters";
import { filterData } from "../utils/chartDataUtils";

function AsistenciaPage() {
  const [user] = useAuthState(auth);
  const [registros, setRegistros] = useState([]);
  const [proyecto, setProyecto] = useState("");
  const [ultimoRegistro, setUltimoRegistro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [proyectos, setProyectos] = useState([]);
  const [nuevoProyecto, setNuevoProyecto] = useState("");
  const [editandoProyecto, setEditandoProyecto] = useState(null);
  const [nombreEditado, setNombreEditado] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [filteredRegistros, setFilteredRegistros] = useState([]);

  const { addNotification } = useNotification();

  useEffect(() => {
    if (user) {
      cargarRegistros();
      cargarProyectos();
    }
  }, [user]);

  useEffect(() => {
    // Aplicar filtros a los registros
    const filtered = filterData(registros, filters);
    setFilteredRegistros(filtered);
  }, [registros, filters]);

  const cargarProyectos = async () => {
    try {
      const proyectosRef = collection(db, "proyectos");
      const q = query(proyectosRef, where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const proyectosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProyectos(proyectosData);
    } catch (error) {
      console.error("Error al cargar proyectos:", error);
      addNotification("Error al cargar los proyectos", "error");
    }
  };

  const validateNewProject = () => {
    if (!nuevoProyecto.trim()) {
      setError("Por favor, ingresa el nombre del proyecto");
      return false;
    }
    
    if (nuevoProyecto.trim().length < 3) {
      setError("El nombre del proyecto debe tener al menos 3 caracteres");
      return false;
    }
    
    if (nuevoProyecto.trim().length > 100) {
      setError("El nombre del proyecto no puede exceder 100 caracteres");
      return false;
    }
    
    // Verificar si ya existe un proyecto con el mismo nombre
    const proyectoExistente = proyectos.find(
      p => p.nombre.toLowerCase() === nuevoProyecto.trim().toLowerCase()
    );
    
    if (proyectoExistente) {
      setError("Ya existe un proyecto con este nombre");
      return false;
    }
    
    return true;
  };

  const agregarProyecto = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!validateNewProject()) {
      return;
    }

    setIsLoading(true);
    try {
      await addDoc(collection(db, "proyectos"), {
        nombre: nuevoProyecto.trim(),
        userId: user.uid,
        fechaCreacion: new Date()
      });
      setNuevoProyecto("");
      await cargarProyectos();
      addNotification("Proyecto creado exitosamente", "success");
    } catch (error) {
      console.error("Error al agregar proyecto:", error);
      setError("Error al crear el proyecto. Intenta de nuevo.");
      addNotification("Error al crear el proyecto", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const eliminarProyecto = async (proyectoId) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este proyecto? Esta acción no se puede deshacer.")) return;

    try {
      await deleteDoc(doc(db, "proyectos", proyectoId));
      await cargarProyectos();
      addNotification("Proyecto eliminado exitosamente", "success");
    } catch (error) {
      console.error("Error al eliminar proyecto:", error);
      addNotification("Error al eliminar el proyecto", "error");
    }
  };

  const iniciarEdicion = (proyecto) => {
    setEditandoProyecto(proyecto.id);
    setNombreEditado(proyecto.nombre);
  };

  const validateEditProject = () => {
    if (!nombreEditado.trim()) {
      setError("Por favor, ingresa el nombre del proyecto");
      return false;
    }
    
    if (nombreEditado.trim().length < 3) {
      setError("El nombre del proyecto debe tener al menos 3 caracteres");
      return false;
    }
    
    if (nombreEditado.trim().length > 100) {
      setError("El nombre del proyecto no puede exceder 100 caracteres");
      return false;
    }
    
    return true;
  };

  const guardarEdicion = async (proyectoId) => {
    setError("");
    
    if (!validateEditProject()) {
      return;
    }

    try {
      // Encontrar el proyecto actual antes de actualizarlo
      const proyectoActual = proyectos.find(p => p.id === proyectoId);
      if (!proyectoActual) {
        setError("Proyecto no encontrado");
        return;
      }

      // Actualizar el nombre del proyecto
      await updateDoc(doc(db, "proyectos", proyectoId), {
        nombre: nombreEditado.trim()
      });

      // Actualizar todos los registros asociados a este proyecto
      const registrosRef = collection(db, "registros");
      const q = query(
        registrosRef,
        where("userId", "==", user.uid),
        where("proyecto", "==", proyectoActual.nombre)
      );
      
      const querySnapshot = await getDocs(q);
      
      // Actualizar cada registro individualmente
      const updatePromises = querySnapshot.docs.map(doc => 
        updateDoc(doc.ref, { proyecto: nombreEditado.trim() })
      );
      
      await Promise.all(updatePromises);
      
      setEditandoProyecto(null);
      await cargarProyectos();
      await cargarRegistros();
      addNotification("Proyecto actualizado exitosamente", "success");
    } catch (error) {
      console.error("Error al editar proyecto:", error);
      setError("Error al editar el proyecto. Por favor, inténtalo de nuevo.");
      addNotification("Error al editar el proyecto", "error");
    }
  };

  const cargarRegistros = async () => {
    try {
      const registrosRef = collection(db, "registros");
      const q = query(registrosRef, where("userId", "==", user.uid));
      
      const querySnapshot = await getDocs(q);
      const registrosData = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .sort((a, b) => b.fecha.toDate() - a.fecha.toDate());
      
      setRegistros(registrosData);
      if (registrosData.length > 0) {
        setUltimoRegistro(registrosData[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar registros:", error);
      setLoading(false);
      addNotification("Error al cargar los registros", "error");
    }
  };

  const registrarEntrada = async () => {
    if (!proyecto) {
      addNotification("Por favor, selecciona un proyecto", "error");
      return;
    }

    if (ultimoRegistro && ultimoRegistro.tipo === "entrada") {
      addNotification("Ya tienes una entrada activa. Registra la salida primero.", "error");
      return;
    }

    try {
      const nuevoRegistro = {
        userId: user.uid,
        email: user.email,
        proyecto: proyecto,
        fecha: new Date(),
        tipo: "entrada",
        estado: "activo"
      };

      await addDoc(collection(db, "registros"), nuevoRegistro);
      await cargarRegistros();
      setProyecto("");
      addNotification("Entrada registrada exitosamente", "success");
    } catch (error) {
      console.error("Error al registrar entrada:", error);
      addNotification("Error al registrar la entrada", "error");
    }
  };

  const registrarSalida = async () => {
    if (!ultimoRegistro || ultimoRegistro.tipo === "salida") {
      addNotification("No hay registro de entrada activo", "error");
      return;
    }

    try {
      const nuevoRegistro = {
        userId: user.uid,
        email: user.email,
        proyecto: ultimoRegistro.proyecto,
        fecha: new Date(),
        tipo: "salida",
        estado: "completado"
      };

      await addDoc(collection(db, "registros"), nuevoRegistro);
      await cargarRegistros();
      addNotification("Salida registrada exitosamente", "success");
    } catch (error) {
      console.error("Error al registrar salida:", error);
      addNotification("Error al registrar la salida", "error");
    }
  };

  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const calcularDuracion = (registro) => {
    if (registro.tipo === "entrada") {
      const siguienteRegistro = registros.find(r => 
        r.tipo === "salida" && 
        r.proyecto === registro.proyecto && 
        r.fecha.toDate() > registro.fecha.toDate()
      );

      if (siguienteRegistro) {
        const duracion = siguienteRegistro.fecha.toDate() - registro.fecha.toDate();
        const horas = Math.floor(duracion / (1000 * 60 * 60));
        const minutos = Math.floor((duracion % (1000 * 60 * 60)) / (1000 * 60));
        return `${horas}h ${minutos}m`;
      }
      return "En curso";
    }
    return "-";
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen text-white">Cargando...</div>;
  }

  return (
    <div className="page-container">
      <div className="content-container">
        <div className="bg-[#1a1a1a] p-8 rounded-[20px] shadow-[0_0_25px_rgba(0,255,255,0.05)]">
          <h1 className="text-4xl bg-gradient-to-r from-[#ff66cc] to-[#00ffff] bg-clip-text text-transparent mb-8 text-center">
            Control de Asistencia
          </h1>

          {/* Filtros avanzados */}
          <SearchAndFilters
            onFiltersChange={handleFiltersChange}
            projects={proyectos}
            showDateFilter={true}
            showProjectFilter={true}
            showStatusFilter={false}
            showTimeFilter={false}
            placeholder="Buscar en registros de asistencia..."
          />

          {/* Gestión de Proyectos */}
          <div className="bg-[#2a2a2a] rounded-[20px] shadow-[0_0_25px_rgba(0,255,255,0.05)] p-6 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Gestión de Proyectos</h2>
            
            {/* Formulario para añadir proyecto */}
            <form onSubmit={agregarProyecto} className="mb-6">
              {error && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded-xl text-red-500">
                  {error}
                </div>
              )}
              <div className="flex gap-4">
                <input
                  type="text"
                  value={nuevoProyecto}
                  onChange={(e) => setNuevoProyecto(e.target.value)}
                  placeholder="Nombre del nuevo proyecto"
                  className="history-input flex-1"
                  disabled={isLoading}
                  maxLength={100}
                />
                <button
                  type="submit"
                  className="btn"
                  disabled={isLoading}
                >
                  {isLoading ? "Añadiendo..." : "Añadir"}
                </button>
              </div>
            </form>

            {/* Lista de proyectos */}
            <div className="space-y-2">
              {proyectos.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No tienes proyectos. ¡Crea tu primer proyecto!</p>
              ) : (
                proyectos.map((proy) => (
                  <div key={proy.id} className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-xl">
                    {editandoProyecto === proy.id ? (
                      <input
                        type="text"
                        value={nombreEditado}
                        onChange={(e) => setNombreEditado(e.target.value)}
                        className="history-input flex-1"
                        maxLength={100}
                      />
                    ) : (
                      <span className="text-white">{proy.nombre}</span>
                    )}
                    <div className="flex gap-2">
                      {editandoProyecto === proy.id ? (
                        <>
                          <button
                            onClick={() => guardarEdicion(proy.id)}
                            className="btn-success"
                            disabled={isLoading}
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => {
                              setEditandoProyecto(null);
                              setError("");
                            }}
                            className="btn-cancel"
                            disabled={isLoading}
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => iniciarEdicion(proy)}
                            className="btn-secondary"
                            disabled={isLoading}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => eliminarProyecto(proy.id)}
                            className="btn-danger"
                            disabled={isLoading}
                          >
                            Eliminar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Control de Asistencia */}
          <div className="bg-[#2a2a2a] rounded-[20px] shadow-[0_0_25px_rgba(0,255,255,0.05)] p-6 mb-8">
            <div className="mb-6">
              <label className="block text-white text-sm font-bold mb-2">
                Seleccionar Proyecto
              </label>
              <select
                value={proyecto}
                onChange={(e) => setProyecto(e.target.value)}
                className="history-input w-full"
                disabled={isLoading}
              >
                <option value="">Selecciona un proyecto</option>
                {proyectos.map((proy) => (
                  <option key={proy.id} value={proy.nombre}>
                    {proy.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-4">
              <button
                onClick={registrarEntrada}
                disabled={!proyecto || (ultimoRegistro && ultimoRegistro.tipo === "entrada") || isLoading}
                className="btn flex-1"
              >
                Fichar Entrada
              </button>
              <button
                onClick={registrarSalida}
                disabled={!ultimoRegistro || ultimoRegistro.tipo === "salida" || isLoading}
                className="btn flex-1"
              >
                Fichar Salida
              </button>
            </div>
          </div>

          {/* Historial de Registros */}
          <div className="bg-[#2a2a2a] rounded-[20px] shadow-[0_0_25px_rgba(0,255,255,0.05)] p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Últimos Registros</h2>
            {filteredRegistros.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                {registros.length === 0 
                  ? "No hay registros de asistencia aún." 
                  : "No hay registros que coincidan con los filtros aplicados."}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-[#3a3a3a]">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Proyecto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Duración
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3a3a3a]">
                    {filteredRegistros.map((registro) => (
                      <tr key={registro.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {new Date(registro.fecha.toDate()).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {registro.proyecto}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              registro.tipo === "entrada"
                                ? "bg-[#ff66cc]/20 text-[#ff66cc]"
                                : "bg-[#00ffff]/20 text-[#00ffff]"
                            }`}
                          >
                            {registro.tipo === "entrada" ? "Entrada" : "Salida"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {calcularDuracion(registro)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AsistenciaPage;
  