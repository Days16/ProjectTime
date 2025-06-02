import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../components/auth/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { deleteDoc } from "firebase/firestore";

function ProyectosPage() {
  const [proyectos, setProyectos] = useState([]);
  const [nuevoProyecto, setNuevoProyecto] = useState("");
  const [nuevoEstado, setNuevoEstado] = useState("Pendiente");
  const [user, setUser] = useState(null);

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
        // Consulta solo proyectos donde ownerId == user.uid
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
        ownerId: user.uid, // Guardamos el uid del usuario
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

  const estadoColor = (estado) => {
    if (estado === "Completado") return "#00ff00";
    if (estado === "En progreso") return "#ffff00";
    if (estado === "Pendiente") return "#ff3300";
    return "#fff";
  };

  if (!user)
    return (
      <p style={{ color: "white" }}>Inicia sesión para ver tus proyectos.</p>
    );

  return (
    <div className="timer-container" style={{ width: "100%", maxWidth: 600 }}>
      <h1 className="timer-title">Seguimiento de Proyectos</h1>

      <div style={{ marginBottom: 20, display: "flex", gap: 10 }}>
        <input
          type="text"
          placeholder="Nombre del proyecto"
          value={nuevoProyecto}
          onChange={(e) => setNuevoProyecto(e.target.value)}
          className="login-input"
          style={{ flex: 2 }}
        />
        <select
          value={nuevoEstado}
          onChange={(e) => setNuevoEstado(e.target.value)}
          className="login-input"
          style={{ flex: 1 }}
        >
          <option value="Pendiente">Pendiente</option>
          <option value="En progreso">En progreso</option>
          <option value="Completado">Completado</option>
        </select>
        <button className="btn" onClick={agregarProyecto} style={{ flex: 1 }}>
          Agregar
        </button>
      </div>

      <table
        style={{ width: "100%", borderCollapse: "collapse", color: "white" }}
      >
        <thead>
          <tr style={{ borderBottom: "2px solid #ff66cc" }}>
            <th style={{ textAlign: "left", padding: "8px" }}>Proyecto</th>
            <th style={{ textAlign: "left", padding: "8px" }}>Estado</th>
          </tr>
        </thead>
        <tbody>
          {proyectos.map(({ id, nombre, estado }) => (
            <tr key={id} style={{ borderBottom: "1px solid #333" }}>
              <td style={{ padding: "8px" }}>{nombre}</td>
              <td style={{ padding: "8px" }}>
                <select
                  value={estado}
                  onChange={(e) => cambiarEstado(id, e.target.value)}
                  style={{
                    backgroundColor: "#1a1a1a",
                    color: estadoColor(estado),
                    fontWeight: "600",
                    border: "none",
                    borderRadius: "0.4rem",
                    padding: "4px 8px",
                    cursor: "pointer",
                    minWidth: "110px",
                  }}
                >
                  <option value="Pendiente" style={{ color: "#ff3300" }}>
                    Pendiente
                  </option>
                  <option value="En progreso" style={{ color: "#ffff00" }}>
                    En progreso
                  </option>
                  <option value="Completado" style={{ color: "#00ff00" }}>
                    Completado
                  </option>
                </select>
              </td>
              <td style={{ padding: "8px" }}>
                <button
                  className="btn"
                  style={{
                    backgroundColor: "#ff4444",
                    color: "white",
                    padding: "4px 8px",
                    borderRadius: "0.4rem",
                    cursor: "pointer",
                  }}
                  onClick={() => eliminarProyecto(id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProyectosPage;
