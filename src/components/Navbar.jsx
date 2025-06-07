// src/components/Navbar.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "../index.css";
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // This effect is not used in the new implementation
    });
    return unsubscribe;
  }, [auth]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <nav className="nav-menu">
      <div className="max-w-7xl mx-auto w-full px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="nav-link">
              Inicio
            </Link>
            {user && (
              <>
                <Link to="/dashboard" className="nav-link">
                  Dashboard
                </Link>
                <Link to="/hour-management" className="nav-link">
                  Historial de Tiempo
                </Link>
                <Link to="/proyectos" className="nav-link">
                  Proyectos
                </Link>
                <Link to="/asistencia" className="nav-link">
                  Asistencia
                </Link>
              </>
            )}
          </div>
          <div className="flex items-center space-x-4">
        {user ? (
              <button
                onClick={handleLogout}
                className="nav-link"
              >
                Cerrar Sesión
              </button>
            ) : (
              <>
                <Link to="/login" className="nav-link">
                  Iniciar Sesión
                </Link>
                <Link to="/register" className="nav-link">
                  Registrarse
                </Link>
              </>
        )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
