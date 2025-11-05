import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export function exportNotesToPDF(notes, filename = 'mis-notas.pdf') {
  const doc = new jsPDF()
  
  // Título
  doc.setFontSize(20)
  doc.setTextColor(102, 126, 234)
  doc.text('Mis Notas', 14, 20)
  
  // Fecha de exportación
  doc.setFontSize(10)
  doc.setTextColor(100)
  const today = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  doc.text(`Exportado el: ${today}`, 14, 28)
  
  // Total de notas
  doc.text(`Total de notas: ${notes.length}`, 14, 34)
  
  // Preparar datos para la tabla
  const tableData = notes.map((note, index) => {
    const tags = note.tags?.map(tag => tag.name).join(', ') || 'Sin tags'
    const favorite = note.is_favorite ? '⭐' : ''
    return [
      index + 1,
      note.title,
      note.content.substring(0, 100) + (note.content.length > 100 ? '...' : ''),
      tags,
      favorite
    ]
  })
  
  // Crear tabla - CAMBIAR doc.autoTable por autoTable
  autoTable(doc, {
    startY: 40,
    head: [['#', 'Título', 'Contenido', 'Tags', 'Fav']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [102, 126, 234],
      textColor: 255,
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 9
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 40 },
      2: { cellWidth: 80 },
      3: { cellWidth: 40 },
      4: { cellWidth: 10 }
    },
    margin: { top: 40 }
  })
  
  // Guardar PDF
  doc.save(filename)
}

export function exportSingleNoteToPDF(note, filename = null) {
  const doc = new jsPDF()
  
  // Título de la nota
  doc.setFontSize(18)
  doc.setTextColor(102, 126, 234)
  doc.text(note.title, 14, 20)
  
  // Fecha de creación
  doc.setFontSize(10)
  doc.setTextColor(100)
  const date = new Date(note.created_at).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  doc.text(`Creada: ${date}`, 14, 28)
  
  // Tags
  if (note.tags && note.tags.length > 0) {
    const tags = note.tags.map(tag => tag.name).join(', ')
    doc.text(`Tags: ${tags}`, 14, 34)
  }
  
  // Favorito
  if (note.is_favorite) {
    doc.text('⭐ Favorita', 14, 40)
  }
  
  // Contenido
  doc.setFontSize(11)
  doc.setTextColor(0)
  const splitContent = doc.splitTextToSize(note.content, 180)
  doc.text(splitContent, 14, note.is_favorite ? 48 : 42)
  
  // Guardar
  const pdfFilename = filename || `${note.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`
  doc.save(pdfFilename)
}

export function exportNotesToCSV(notes, filename = 'mis-notas.csv') {
  // Encabezados
  const headers = ['ID', 'Título', 'Contenido', 'Tags', 'Favorita', 'Fecha de creación']
  
  // Función para escapar valores CSV
  const escapeCSV = (value) => {
    if (value === null || value === undefined) return ''
    const stringValue = String(value)
    // Si contiene comas, comillas o saltos de línea, envolver en comillas
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`
    }
    return stringValue
  }
  
  // Preparar datos
  const rows = notes.map(note => [
    note.id,
    escapeCSV(note.title),
    escapeCSV(note.content),
    escapeCSV(note.tags?.map(tag => tag.name).join('; ') || ''),
    note.is_favorite ? 'Sí' : 'No',
    new Date(note.created_at).toLocaleDateString('es-ES')
  ])
  
  // Construir CSV
  let csv = headers.join(',') + '\n'
  rows.forEach(row => {
    csv += row.join(',') + '\n'
  })
  
  // Crear blob y descargar
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}