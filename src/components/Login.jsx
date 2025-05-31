import React, { useState } from "react"

export default function Login({ setUser }) {
  const [username, setUsername] = useState("")

  const handleLogin = () => {
    if (username.trim()) {
      localStorage.setItem("user", username)
      setUser(username)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Iniciar sesión</h2>
        <input
          className="login-input"
          placeholder="Tu nombre de usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button className="login-button" onClick={handleLogin}>
          Entrar
        </button>
      </div>
    </div>
  )
}
