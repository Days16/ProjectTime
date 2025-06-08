import React, { useState, useEffect } from "react";
import { auth, db } from "../auth/firebase";
import { collection, addDoc, query, where, getDocs, orderBy, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

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

  useEffect(() => {
    if (user) {
      cargarRegistros();
      cargarProyectos();
    }
  }, [user]);

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
    }
  };

  const agregarProyecto = async (e) => {
    e.preventDefault();
    if (!nuevoProyecto.trim()) return;

    try {
      await addDoc(collection(db, "proyectos"), {
        nombre: nuevoProyecto.trim(),
        userId: user.uid,
        fechaCreacion: new Date()
      });
      setNuevoProyecto("");
      await cargarProyectos();
    } catch (error) {
      console.error("Error al agregar proyecto:", error);
    }
  };

  const eliminarProyecto = async (proyectoId) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este proyecto?")) return;

    try {
      await deleteDoc(doc(db, "proyectos", proyectoId));
      await cargarProyectos();
    } catch (error) {
      console.error("Error al eliminar proyecto:", error);
    }
  };

  const iniciarEdicion = (proyecto) => {
    setEditandoProyecto(proyecto.id);
    setNombreEditado(proyecto.nombre);
  };

  const guardarEdicion = async (proyectoId) => {
    if (!nombreEditado.trim()) return;

    try {
      await updateDoc(doc(db, "proyectos", proyectoId), {
        nombre: nombreEditado.trim()
      });
      setEditandoProyecto(null);
      await cargarProyectos();
    } catch (error) {
      console.error("Error al editar proyecto:", error);
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
    }
  };

  const registrarEntrada = async () => {
    if (!proyecto) {
      alert("Por favor, selecciona un proyecto");
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
    } catch (error) {
      console.error("Error al registrar entrada:", error);
    }
  };

  const registrarSalida = async () => {
    if (!ultimoRegistro || ultimoRegistro.tipo === "salida") {
      alert("No hay registro de entrada activo");
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
    } catch (error) {
      console.error("Error al registrar salida:", error);
    }
  };

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
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl bg-gradient-to-r from-[#ff66cc] to-[#00ffff] bg-clip-text text-transparent mb-8">
          Control de Asistencia
        </h1>

        {/* Gestión de Proyectos */}
        <div className="bg-[#2a2a2a] rounded-[20px] shadow-[0_0_25px_rgba(0,255,255,0.05)] p-6 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Gestión de Proyectos</h2>
          
          {/* Formulario para añadir proyecto */}
          <form onSubmit={agregarProyecto} className="mb-6">
            <div className="flex gap-4">
              <input
                type="text"
                value={nuevoProyecto}
                onChange={(e) => setNuevoProyecto(e.target.value)}
                placeholder="Nombre del nuevo proyecto"
                className="flex-1 p-3 bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl text-white focus:outline-none focus:border-[#ff66cc] transition-all duration-300"
              />
              <button
                type="submit"
                className="py-3 px-6 bg-gradient-to-r from-[#ff66cc] to-[#00ffff] text-[#1a1a1a] font-bold rounded-xl hover:opacity-90 transition-all duration-300"
              >
                Añadir
              </button>
            </div>
          </form>

          {/* Lista de proyectos */}
          <div className="space-y-2">
            {proyectos.map((proy) => (
              <div key={proy.id} className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-xl">
                {editandoProyecto === proy.id ? (
                  <input
                    type="text"
                    value={nombreEditado}
                    onChange={(e) => setNombreEditado(e.target.value)}
                    className="flex-1 p-2 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg text-white focus:outline-none focus:border-[#ff66cc]"
                  />
                ) : (
                  <span className="text-white">{proy.nombre}</span>
                )}
                <div className="flex gap-2">
                  {editandoProyecto === proy.id ? (
                    <>
                      <button
                        onClick={() => guardarEdicion(proy.id)}
                        className="px-3 py-1 bg-[#00ffff] text-[#1a1a1a] rounded-lg hover:opacity-90"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditandoProyecto(null)}
                        className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:opacity-90"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => iniciarEdicion(proy)}
                        className="px-3 py-1 bg-[#ff66cc] text-white rounded-lg hover:opacity-90"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => eliminarProyecto(proy.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg hover:opacity-90"
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
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
              className="w-full p-3 bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl text-white focus:outline-none focus:border-[#ff66cc] transition-all duration-300"
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
              disabled={!proyecto || (ultimoRegistro && ultimoRegistro.tipo === "entrada")}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-[#ff66cc] to-[#00ffff] text-[#1a1a1a] font-bold rounded-xl hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Fichar Entrada
            </button>
            <button
              onClick={registrarSalida}
              disabled={!ultimoRegistro || ultimoRegistro.tipo === "salida"}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-[#ff66cc] to-[#00ffff] text-[#1a1a1a] font-bold rounded-xl hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Fichar Salida
            </button>
          </div>
        </div>

        {/* Historial de Registros */}
        <div className="bg-[#2a2a2a] rounded-[20px] shadow-[0_0_25px_rgba(0,255,255,0.05)] p-6">
          <h2 className="text-2xl font-semibold text-white mb-4">Últimos Registros</h2>
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
                {registros.map((registro) => (
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
        </div>
      </div>
    </div>
  );
}

export default AsistenciaPage;
  