// src/components/Login.jsx
import React, { useState } from "react";
import { auth, signInWithEmailAndPassword } from "../config/firebase";  

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    if (!email.trim()) {
      setError("Por favor, ingresa tu email");
      return false;
    }
    
    if (!email.includes('@') || !email.includes('.')) {
      setError("Por favor, ingresa un email válido");
      return false;
    }
    
    if (!password.trim()) {
      setError("Por favor, ingresa tu contraseña");
      return false;
    }
    
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return false;
    }
    
    return true;
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirige si quieres, por ejemplo: window.location.href = "/";
    } catch (error) {
      let errorMessage = "Error al iniciar sesión";
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = "No existe una cuenta con este email";
          break;
        case 'auth/wrong-password':
          errorMessage = "Contraseña incorrecta";
          break;
        case 'auth/invalid-email':
          errorMessage = "Email inválido";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Demasiados intentos fallidos. Intenta más tarde";
          break;
        default:
          errorMessage = "Error: " + error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
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
                placeholder="tu@email.com"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-white mb-2">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl text-white focus:outline-none focus:border-[#ff66cc] transition-all duration-300"
                placeholder="Mínimo 6 caracteres"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-6 bg-gradient-to-r from-[#ff66cc] to-[#00ffff] text-[#1a1a1a] font-bold rounded-xl hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
