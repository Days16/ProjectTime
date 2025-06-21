// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from './Notification';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { addNotification } = useNotification();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      addNotification('Sesión cerrada exitosamente', 'success');
    } catch (error) {
      addNotification('Error al cerrar sesión', 'error');
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/hour-management', label: 'Gestión de Horas', icon: '⏱️' },
    { path: '/proyectos', label: 'Proyectos', icon: '📁' },
    { path: '/asistencia', label: 'Asistencia', icon: '📅' }
  ];

  return (
    <nav className="bg-[#1a1a1a] shadow-[0_0_20px_rgba(0,255,255,0.1)] border-b border-[#3a3a3a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="text-2xl">⏰</div>
              <span className="text-xl font-bold bg-gradient-to-r from-[#ff66cc] to-[#00ffff] bg-clip-text text-transparent">
                ProjectTime
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                  isActive(item.path)
                    ? 'bg-[#00ffff]/20 text-[#00ffff]'
                    : 'text-gray-300 hover:text-white hover:bg-[#2a2a2a]'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-sm text-gray-400">
              {user?.email}
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-300"
            >
              Cerrar Sesión
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#2a2a2a]"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#3a3a3a]">
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                    isActive(item.path)
                      ? 'bg-[#00ffff]/20 text-[#00ffff]'
                      : 'text-gray-300 hover:text-white hover:bg-[#2a2a2a]'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-[#3a3a3a]">
              <div className="text-sm text-gray-400 mb-2">{user?.email}</div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
