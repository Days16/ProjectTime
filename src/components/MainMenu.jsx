// src/components/MainMenu.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";

function MainMenu() {
  const navigate = useNavigate();

  return (
    <div className="main-menu">
      <h1 className="main-title">Menú Principal</h1>
      <div className="menu-buttons">
        <button className="btn" onClick={() => navigate("/temporizador")}>Temporizador</button>
        <button className="btn" onClick={() => navigate("/asistencia")}>Asistencia</button>
        <button className="btn" onClick={() => navigate("/proyectos")}>Proyectos</button>
      </div>
    </div>
  );
}

export default MainMenu;
