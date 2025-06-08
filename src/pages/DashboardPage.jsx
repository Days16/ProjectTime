// src/components/Dashboard.jsx
import React from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { auth } from "../auth/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

function Dashboard() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-[#00ffff] animate-pulse">Cargando...</div>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="min-h-screen flex items-center justify-center  p-4">
      <div className="w-full max-w-md p-8 bg-[#1a1a1a] rounded-[20px] shadow-[0_0_25px_rgba(0,255,255,0.05)]">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-[#ff66cc] to-[#00ffff] bg-clip-text text-transparent">
          Bienvenido
        </h1>
        <div className="text-center text-white text-lg">
          <p className="mb-4">👤 {user.displayName || user.email}</p>
              <button
                onClick={handleLogout}
                className="nav-link"
              >
                Cerrar Sesión
              </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
