// src/components/Navbar.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "../index.css";

function Navbar({ onLogout }) {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, [auth]);

  return (
    <nav className="fixed top-0 w-full bg-[#1a1a1a] px-4 md:px-8 py-4 shadow-[0_2px_10px_rgba(0,0,0,0.5)] z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/home" className="text-2xl font-bold bg-gradient-to-r from-[#ff66cc] to-[#00ffff] bg-clip-text text-transparent">
              TimeTracker
            </Link>
          </div>

          {/* Botón de menú móvil */}
          <button 
            className="md:hidden text-white p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Menú de navegación */}
          <ul className={`${isMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row absolute md:relative top-16 md:top-0 left-0 w-full md:w-auto bg-[#1a1a1a] md:bg-transparent p-4 md:p-0 space-y-4 md:space-y-0 md:space-x-8 items-center`}>
            <li><Link to="/home" className="text-white no-underline font-bold text-lg transition-all duration-300 pb-1 hover:text-[#ff66cc] hover:border-b-2 hover:border-[#ff66cc]">Home</Link></li>
            <li><Link to="/hour-management" className="text-white no-underline font-bold text-lg transition-all duration-300 pb-1 hover:text-[#ff66cc] hover:border-b-2 hover:border-[#ff66cc]">Hour Management</Link></li>
            <li><Link to="/asistencia" className="text-white no-underline font-bold text-lg transition-all duration-300 pb-1 hover:text-[#ff66cc] hover:border-b-2 hover:border-[#ff66cc]">Asistencia</Link></li>
            <li><Link to="/proyectos" className="text-white no-underline font-bold text-lg transition-all duration-300 pb-1 hover:text-[#ff66cc] hover:border-b-2 hover:border-[#ff66cc]">Proyectos</Link></li>

            {user ? (
              <>
                <li>
                  <button 
                    onClick={onLogout}
                    className="bg-[#2a2a2a] text-[#ff66cc] border border-[#ff66cc] px-4 py-2 rounded-xl hover:bg-[#ff66cc] hover:text-[#1a1a1a] transition-all duration-300"
                  >
                    Logout
                  </button>
                </li>
                <li className="text-white px-4 self-center flex items-center">
                  <span className="hidden md:inline-block mr-2">👤</span>
                  {user.displayName || user.email}
                </li>
              </>
            ) : (
              <li className="text-white px-4 self-center">
                No has iniciado sesión
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
