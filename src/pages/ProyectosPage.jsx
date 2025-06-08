import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";  
import { getAuth, onAuthStateChanged } from "firebase/auth";

function ProyectosPage() {
  const [proyectos, setProyectos] = useState([]);
  const [nuevoProyecto, setNuevoProyecto] = useState("");
  const [nuevoEstado, setNuevoEstado] = useState("Pendiente");
  const [user, setUser] = useState(null);
  const [isAddingProject, setIsAddingProject] = useState(false);

  const auth = getAuth();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, [auth]);

  useEffect(() => {
    if (!user) {
      setProyectos([]);
      return;
    }

    const fetchProyectos = async () => {
      try {
        const proyectosRef = collection(db, "proyectos");
        const q = query(proyectosRef, where("ownerId", "==", user.uid));
        const data = await getDocs(q);
        const lista = data.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProyectos(lista);
      } catch (error) {
        console.error("Error al cargar proyectos:", error);
      }
    };

    fetchProyectos();
  }, [user]);

  const agregarProyecto = async () => {
    if (nuevoProyecto.trim() === "" || !user) return;

    try {
      const proyectosRef = collection(db, "proyectos");
      const docRef = await addDoc(proyectosRef, {
        nombre: nuevoProyecto,
        estado: nuevoEstado,
        ownerId: user.uid,
      });

      setProyectos([
        ...proyectos,
        {
          id: docRef.id,
          nombre: nuevoProyecto,
          estado: nuevoEstado,
          ownerId: user.uid,
        },
      ]);
      setNuevoProyecto("");
      setNuevoEstado("Pendiente");
      setIsAddingProject(false);
    } catch (error) {
      console.error("Error al agregar proyecto:", error);
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      const proyectoDoc = doc(db, "proyectos", id);
      await updateDoc(proyectoDoc, { estado: nuevoEstado });
      setProyectos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, estado: nuevoEstado } : p))
      );
    } catch (error) {
      console.error("Error al actualizar estado:", error);
    }
  };

  const eliminarProyecto = async (id) => {
    try {
      await deleteDoc(doc(db, "proyectos", id));
      setProyectos((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error al eliminar proyecto:", error);
    }
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'En progreso':
        return 'text-[#00ffff]';
      case 'Completado':
        return 'text-[#00ff88]';
      case 'Pendiente':
        return 'text-[#ff66cc]';
      default:
        return 'text-white';
    }
  };

  if (!user) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="bg-[#1a1a1a] p-8 rounded-[20px] shadow-[0_0_25px_rgba(0,255,255,0.05)]">
            <p className="text-white text-center">Inicia sesión para ver tus proyectos.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-container">
        <div className="bg-[#1a1a1a] p-8 rounded-[20px] shadow-[0_0_25px_rgba(0,255,255,0.05)]">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl bg-gradient-to-r from-[#ff66cc] to-[#00ffff] bg-clip-text text-transparent">
              Seguimiento de Proyectos
            </h1>
            <button
              onClick={() => setIsAddingProject(true)}
              className="btn"
            >
              Nuevo Proyecto
            </button>
          </div>

          {isAddingProject && (
            <div className="bg-[#2a2a2a] p-6 rounded-xl mb-8">
              <h2 className="text-2xl text-[#00ffff] mb-4">Añadir Nuevo Proyecto</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Nombre del proyecto"
                  value={nuevoProyecto}
                  onChange={(e) => setNuevoProyecto(e.target.value)}
                  className="history-input"
                />
                <select
                  value={nuevoEstado}
                  onChange={(e) => setNuevoEstado(e.target.value)}
                  className="history-input"
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="En progreso">En progreso</option>
                  <option value="Completado">Completado</option>
                </select>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setIsAddingProject(false)}
                  className="btn-cancel"
                >
                  Cancelar
                </button>
                <button
                  onClick={agregarProyecto}
                  className="btn-success"
                >
                  Guardar
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {proyectos.map((proyecto) => (
              <div
                key={proyecto.id}
                className="bg-[#2a2a2a] p-6 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.2)] hover:shadow-[0_0_20px_rgba(0,255,255,0.1)] transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-white">{proyecto.nombre}</h3>
                  <button
                    onClick={() => eliminarProyecto(proyecto.id)}
                    className="text-red-500 hover:text-red-400 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <select
                    value={proyecto.estado}
                    onChange={(e) => cambiarEstado(proyecto.id, e.target.value)}
                    className={`${getStatusColor(proyecto.estado)} bg-transparent border-none focus:outline-none cursor-pointer`}
                  >
                    <option value="Pendiente" className="text-[#ff66cc]">Pendiente</option>
                    <option value="En progreso" className="text-[#00ffff]">En progreso</option>
                    <option value="Completado" className="text-[#00ff88]">Completado</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProyectosPage;
