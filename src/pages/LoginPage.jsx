// src/components/Login.jsx
import React, { useState } from "react";
import { auth, signInWithEmailAndPassword } from "../auth/firebase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirige si quieres, por ejemplo: window.location.href = "/";
    } catch (error) {
      setError("Error: " + error.message);
    }
  };

  return (
    <div className="page-container flex items-center justify-center min-h-screen">
      <div className="content-container w-full max-w-md">
        <div className="login-box">
          <h1 className="login-title">Iniciar Sesión</h1>
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded-xl text-red-500">
              {error}
            </div>
          )}
          <form onSubmit={handleEmailLogin} className="space-y-6">
            <div>
              <label className="block text-white mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl text-white focus:outline-none focus:border-[#ff66cc] transition-all duration-300"
                required
              />
            </div>
            <div>
              <label className="block text-white mb-2">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl text-white focus:outline-none focus:border-[#ff66cc] transition-all duration-300"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 px-6 bg-gradient-to-r from-[#ff66cc] to-[#00ffff] text-[#1a1a1a] font-bold rounded-xl hover:opacity-90 transition-all duration-300"
            >
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
