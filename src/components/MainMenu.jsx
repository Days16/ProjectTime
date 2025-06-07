// src/components/MainMenu.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

function MainMenu() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] p-4">
      <div className="w-full max-w-md p-8 bg-[#1a1a1a] rounded-[20px] shadow-[0_0_25px_rgba(0,255,255,0.05)]">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-[#ff66cc] to-[#00ffff] bg-clip-text text-transparent">
          Menú Principal
        </h1>
        <div className="space-y-4">
          <button 
            onClick={() => navigate("/hour-management")}
            className="w-full py-3 px-6 bg-gradient-to-r from-[#ff66cc] to-[#00ffff] text-[#1a1a1a] font-bold rounded-xl hover:opacity-90 transition-all duration-300"
          >
            Gestión de Horas
          </button>
          <button 
            onClick={() => navigate("/asistencia")}
            className="w-full py-3 px-6 bg-gradient-to-r from-[#ff66cc] to-[#00ffff] text-[#1a1a1a] font-bold rounded-xl hover:opacity-90 transition-all duration-300"
          >
            Asistencia
          </button>
          <button 
            onClick={() => navigate("/proyectos")}
            className="w-full py-3 px-6 bg-gradient-to-r from-[#ff66cc] to-[#00ffff] text-[#1a1a1a] font-bold rounded-xl hover:opacity-90 transition-all duration-300"
          >
            Proyectos
          </button>
        </div>
      </div>
    </div>
  );
}

export default MainMenu;
