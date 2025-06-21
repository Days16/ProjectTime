import React, { createContext, useContext, useEffect, useState } from "react"
import { auth } from "../config/firebase"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { useNavigate } from "react-router-dom"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
      
      // Si el usuario está autenticado y está en la página de login, redirigir al dashboard
      if (user && window.location.pathname === '/login') {
        navigate('/dashboard', { replace: true })
      }
    })

    return () => unsubscribe()
  }, [navigate])

  const logout = async () => {
    try {
      await signOut(auth)
      navigate('/login', { replace: true })
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      throw error
    }
  }

  const value = {
    user,
    loading,
    logout,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
} 