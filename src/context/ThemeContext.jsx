import React, { createContext, useContext, useEffect, useState } from "react"

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme debe ser usado dentro de un ThemeProvider")
  }
  return context
}

const themes = {
  dark: {
    background: "bg-gray-900",
    text: "text-white",
    primary: "bg-blue-600",
    secondary: "bg-gray-800",
    accent: "bg-blue-500",
    border: "border-gray-700",
    hover: "hover:bg-gray-700",
    input: "bg-gray-800 text-white border-gray-700",
    button: "bg-blue-600 hover:bg-blue-700 text-white",
    card: "bg-gray-800 border-gray-700"
  },
  light: {
    background: "bg-gray-100",
    text: "text-gray-900",
    primary: "bg-blue-500",
    secondary: "bg-white",
    accent: "bg-blue-400",
    border: "border-gray-300",
    hover: "hover:bg-gray-200",
    input: "bg-white text-gray-900 border-gray-300",
    button: "bg-blue-500 hover:bg-blue-600 text-white",
    card: "bg-white border-gray-300"
  }
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme")
    return savedTheme || "dark"
  })

  useEffect(() => {
    localStorage.setItem("theme", theme)
    document.documentElement.classList.remove("dark", "light")
    document.documentElement.classList.add(theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark")
  }

  const value = {
    theme,
    themeStyles: themes[theme],
    toggleTheme
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
} 