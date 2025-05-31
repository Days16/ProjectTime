import React from "react"

export default function ExportImportData({ user }) {
  const exportData = () => {
    const allKeys = Object.keys(localStorage).filter(k => k.startsWith(`worktime_${user}_`))
    const data = {}
    allKeys.forEach(key => {
      data[key] = Number(localStorage.getItem(key))
    })

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = `asistencia_${user}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importData = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result)
        Object.entries(data).forEach(([key, value]) => {
          if (key.startsWith(`worktime_${user}_`)) {
            localStorage.setItem(key, value)
          }
        })
        alert("Datos importados correctamente.")
      } catch (err) {
        alert("Error al leer el archivo JSON.")
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="export-import-container">
      <button className="btn" onClick={exportData}>
        Exportar JSON
      </button>

      <label className="label-button">
        Importar JSON
        <input type="file" accept=".json" onChange={importData} />
      </label>
    </div>
  )
}
