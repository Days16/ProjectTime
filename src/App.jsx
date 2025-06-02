// src/App.jsx
import React, { useEffect, useState } from "react";
import { auth } from "./components/auth/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Login from "./components/auth/Login";
import Timer from "./components/Timer";
import ExportImportData from "./components/ExportImportData";
import History from "./components/History";
import "./index.css"

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const handleLogout = () => signOut(auth);

  if (!user) return <Login />;

  return (
    <div className="app-container">
      <div className="logged-in-container">
        <h1 className="timer-title">Bienvenido, {user.displayName || user.email}</h1>
        <Timer user={user} />
        <ExportImportData user={user} />
        <History user={user} />
        <button className="btn" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

export default App;
