import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/DashboardPage';
import HourManagementPage from './pages/HourManagementPage';
import ProyectosPage from './pages/ProyectosPage';
import AsistenciaPage from './pages/AsistenciaPage';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hour-management"
          element={
            <ProtectedRoute>
              <HourManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/proyectos"
          element={
            <ProtectedRoute>
              <ProyectosPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/asistencia"
          element={
            <ProtectedRoute>
              <AsistenciaPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
};

export default AppRoutes; 