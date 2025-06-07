import { jsPDF } from "jspdf"
import "jspdf-autotable"
import * as XLSX from "xlsx"

export const exportService = {
  async exportToPDF(data, title) {
    const doc = new jsPDF()
    
    // Título
    doc.setFontSize(16)
    doc.text(title, 14, 15)
    
    // Tabla
    const tableColumn = ["Proyecto", "Fecha", "Horas"]
    const tableRows = data.map(item => [
      item.project,
      item.date,
      this.formatTime(item.seconds)
    ])
    
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255
      }
    })
    
    // Resumen
    const totalHours = data.reduce((acc, item) => acc + item.seconds, 0)
    doc.text(`Total de horas: ${this.formatTime(totalHours)}`, 14, doc.lastAutoTable.finalY + 10)
    
    doc.save(`${title.toLowerCase().replace(/\s+/g, "_")}.pdf`)
  },
  
  async exportToExcel(data, title) {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map(item => ({
        Proyecto: item.project,
        Fecha: item.date,
        Horas: this.formatTime(item.seconds)
      }))
    )
    
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Datos")
    
    // Agregar resumen
    const totalHours = data.reduce((acc, item) => acc + item.seconds, 0)
    const summarySheet = XLSX.utils.json_to_sheet([
      { "Total de horas": this.formatTime(totalHours) }
    ])
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumen")
    
    XLSX.writeFile(workbook, `${title.toLowerCase().replace(/\s+/g, "_")}.xlsx`)
  },
  
  formatTime(seconds) {
    const h = Math.floor(seconds / 3600).toString().padStart(2, "0")
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0")
    const s = (seconds % 60).toString().padStart(2, "0")
    return `${h}:${m}:${s}`
  }
}