// src/components/Navbar.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "../index.css";

function Navbar({ onLogout }) {
  const [user, setUser] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, [auth]);

  return (
    <nav className="nav-menu">
      <ul className="nav-list">
        <li><Link to="/home" className="nav-link">Home</Link></li>
        <li><Link to="/temporizador" className="nav-link">Temporizador</Link></li>
        <li><Link to="/asistencia" className="nav-link">Asistencia</Link></li>
        <li><Link to="/proyectos" className="nav-link">Proyectos</Link></li>

        {user ? (
          <>
            <li>
              <button className="btn" onClick={onLogout}>Cerrar sesión</button>
            </li>
            <li style={{ color: "white", padding: "0 1rem", alignSelf: "center" }}>
              {user.displayName || user.email}
            </li>
          </>
        ) : (
          <li style={{ color: "white", padding: "0 1rem", alignSelf: "center" }}>
            No has iniciado sesión
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
