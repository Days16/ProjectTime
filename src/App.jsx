import React from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { NotificationProvider } from "./components/Notification"
import { ThemeProvider } from "./context/ThemeContext"
import ProtectedRoute from "./auth/ProtectedRoute"  
import Navbar from "./components/Navbar"
import MainMenu from "./components/MainMenu"
import Login from "./pages/Login"
import Dashboard from "./components/Dashboard"
import History from "./components/History"
import HourManagementPage from "./pages/HourManagementPage"
import ProyectosPage from "./pages/ProyectosPage"
import AsistenciaPage from "./pages/AsistenciaPage"

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
            <div className="min-h-screen">
              <Navbar />
              <div className="container mx-auto px-4 py-8">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <MainMenu />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/history"
                    element={
                      <ProtectedRoute>
                        <History />
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
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </div>
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
