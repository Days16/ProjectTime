import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { auth } from "./components/auth/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Login from "./components/auth/Login";
import Navbar from "./components/Navbar";
import MainMenu from "./components/MainMenu";
import TimerPage from "./pages/TimerPage";
import AsistenciaPage from "./pages/AsistenciaPage";
import ProyectosPage from "./pages/ProyectosPage";
import "./index.css";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const handleLogout = () => signOut(auth);

  if (!user) return <Login />;

  return (
    <Router>
      <div className="app-container">
        <Navbar onLogout={handleLogout} />
        <div className="logged-in-container">
          <Routes>
            <Route path="/" element={<Navigate to="/inicio" />} />
            <Route path="/home" element={<MainMenu />} />
            <Route path="/temporizador" element={<TimerPage user={user} />} />
            <Route path="/asistencia" element={<AsistenciaPage />} />
            <Route path="/proyectos" element={<ProyectosPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
