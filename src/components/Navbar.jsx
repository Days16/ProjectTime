// src/components/Navbar.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../index.css"; // Puedes mover el CSS que te di aquí

function Navbar({ onLogout }) {
  return (
    <nav className="nav-menu">
      <ul className="nav-list">
        <li><Link to="/home" className="nav-link">Home</Link></li>
        <li><Link to="/temporizador" className="nav-link">Temporizador</Link></li>
        <li><Link to="/asistencia" className="nav-link">Asistencia</Link></li>
        <li><Link to="/proyectos" className="nav-link">Proyectos</Link></li>
        <li><button className="btn" onClick={onLogout}>Cerrar sesión</button></li>
      </ul>
    </nav>
  );
}

export default Navbar;
