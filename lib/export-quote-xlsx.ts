import ExcelJS from "exceljs"
import { saveAs } from "file-saver"
import { Category, CATEGORIES } from "@/lib/cotizador-data"

export type QuoteExportInput = {
  categories?: Category[]
  company: string
  date: string
  ocData: string
  discount: string
  isPercent: boolean
  observations: string
  quantities: Record<string, number>
  net: number
  iva: number
  discountValue: number
  finalTotal: number
}

// Logo PNG placeholder in base64 (Tijerales brand placeholder)
const TIJERALES_LOGO_BASE64 =
  "data:image/png;base64,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"

function safeFilePart(value: string, fallback: string): string {
  const cleaned = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[<>:"/\\|?*]+/g, "")
    .trim()
    .replace(/\s+/g, "-")
  return cleaned || fallback
}

// Helper to style borders on a range of merged or single cells
function applyBorders(
  worksheet: ExcelJS.Worksheet,
  startRow: number,
  endRow: number,
  startCol: number,
  endCol: number,
  borderStyle: ExcelJS.BorderStyle = "thin",
) {
  const border: Partial<ExcelJS.Borders> = {
    top: { style: borderStyle, color: { argb: "FF000000" } },
    left: { style: borderStyle, color: { argb: "FF000000" } },
    bottom: { style: borderStyle, color: { argb: "FF000000" } },
    right: { style: borderStyle, color: { argb: "FF000000" } },
  }

  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      const cell = worksheet.getCell(r, c)
      cell.border = border
    }
  }
}

export async function downloadQuoteXlsx(data: QuoteExportInput): Promise<void> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = "Tijerales Estructuras & Eventos"
  workbook.created = new Date()

  const worksheet = workbook.addWorksheet("Cotización", {
    views: [{ showGridLines: true }],
  })

  // Set column widths
  worksheet.columns = [
    { key: "A", width: 4 }, // Padding column
    { key: "B", width: 14 }, // Cantidad
    { key: "C", width: 14 }, // Servicio (part of C:H)
    { key: "D", width: 14 },
    { key: "E", width: 14 },
    { key: "F", width: 14 },
    { key: "G", width: 14 },
    { key: "H", width: 14 },
    { key: "I", width: 20 }, // Valor
  ]

  // Set row heights for rows 1 to 6
  for (let r = 1; r <= 6; r++) {
    worksheet.getRow(r).height = 18
  }

  // 1. ENCABEZADO FIJO (Filas 1 a 6: Logo)
  try {
    const logoImageId = workbook.addImage({
      base64: TIJERALES_LOGO_BASE64,
      extension: "png",
    })

    worksheet.addImage(logoImageId, {
      tl: { col: 3.8, row: 0.8 },
      ext: { width: 180, height: 80 },
    })
  } catch (e) {
    console.warn("Could not insert logo image:", e)
  }

  // Fila 7: Título "Desglose Formal Servicios Tijerales 2026"
  worksheet.mergeCells("B7:H7")
  const titleCell = worksheet.getCell("B7")
  titleCell.value = "Desglose Formal Servicios Tijerales 2026"
  titleCell.font = { name: "Arial", size: 12, bold: true, color: { argb: "FF000000" } }
  titleCell.alignment = { horizontal: "center", vertical: "middle" }
  applyBorders(worksheet, 7, 7, 2, 8)
  worksheet.getRow(7).height = 24

  // Fila 8: Subtítulo "Datos OC/Banco tranferencia"
  worksheet.mergeCells("B8:H8")
  const subtitleCell = worksheet.getCell("B8")
  subtitleCell.value = "Datos OC/Banco tranferencia"
  subtitleCell.font = { name: "Arial", size: 10, bold: false, color: { argb: "FF000000" } }
  subtitleCell.alignment = { horizontal: "center", vertical: "middle" }
  applyBorders(worksheet, 8, 8, 2, 8)
  worksheet.getRow(8).height = 20

  // Filas 9 a 11: Espaciado
  worksheet.getRow(9).height = 12
  worksheet.getRow(10).height = 12
  worksheet.getRow(11).height = 12

  // 2. TABLA DINÁMICA DE SERVICIOS
  // Fila 12 (Cabeceras de tabla)
  const headerRow = worksheet.getRow(12)
  headerRow.height = 22

  const colBCell = worksheet.getCell("B12")
  colBCell.value = "Cantidad"
  colBCell.font = { name: "Arial", size: 10, bold: true }
  colBCell.alignment = { horizontal: "center", vertical: "middle" }
  applyBorders(worksheet, 12, 12, 2, 2)

  worksheet.mergeCells("C12:H12")
  const colCHCell = worksheet.getCell("C12")
  colCHCell.value = "Servicio"
  colCHCell.font = { name: "Arial", size: 10, bold: true }
  colCHCell.alignment = { horizontal: "center", vertical: "middle" }
  applyBorders(worksheet, 12, 12, 3, 8)

  const colICell = worksheet.getCell("I12")
  colICell.value = "Valor"
  colICell.font = { name: "Arial", size: 10, bold: true }
  colICell.alignment = { horizontal: "center", vertical: "middle" }
  applyBorders(worksheet, 12, 12, 9, 9)

  // Filtrar ÚNICAMENTE los servicios seleccionados (cantidad > 0)
  const sourceCategories = data.categories || CATEGORIES
  const selectedItems: Array<{ name: string; qty: number; price: number; total: number }> = []

  sourceCategories
    .filter((c) => c.id !== "resumen")
    .forEach((cat) => {
      cat.items.forEach((item) => {
        const qty = data.quantities[item.id] ?? 0
        if (qty > 0) {
          selectedItems.push({
            name: item.name,
            qty,
            price: item.price,
            total: qty * item.price,
          })
        }
      })
    })

  let currentRow = 13

  if (selectedItems.length === 0) {
    // Fila vacía informativa si no se seleccionó ningún ítem
    const row = worksheet.getRow(currentRow)
    row.height = 20
    worksheet.getCell(`B${currentRow}`).value = 0
    worksheet.getCell(`B${currentRow}`).alignment = { horizontal: "center", vertical: "middle" }
    applyBorders(worksheet, currentRow, currentRow, 2, 2)

    worksheet.mergeCells(`C${currentRow}:H${currentRow}`)
    const emptyCell = worksheet.getCell(`C${currentRow}`)
    emptyCell.value = "Sin servicios seleccionados"
    emptyCell.font = { name: "Arial", size: 10, italic: true }
    emptyCell.alignment = { horizontal: "center", vertical: "middle" }
    applyBorders(worksheet, currentRow, currentRow, 3, 8)

    const valCell = worksheet.getCell(`I${currentRow}`)
    valCell.value = 0
    valCell.numFmt = '"$"#,##0'
    valCell.alignment = { horizontal: "right", vertical: "middle" }
    applyBorders(worksheet, currentRow, currentRow, 9, 9)
    currentRow++
  } else {
    selectedItems.forEach((item) => {
      const row = worksheet.getRow(currentRow)
      row.height = 20

      // Col B: Cantidad
      const qtyCell = worksheet.getCell(`B${currentRow}`)
      qtyCell.value = item.qty
      qtyCell.font = { name: "Arial", size: 10 }
      qtyCell.alignment = { horizontal: "center", vertical: "middle" }
      applyBorders(worksheet, currentRow, currentRow, 2, 2)

      // Col C:H (combinadas): Nombre del servicio
      worksheet.mergeCells(`C${currentRow}:H${currentRow}`)
      const nameCell = worksheet.getCell(`C${currentRow}`)
      nameCell.value = item.name
      nameCell.font = { name: "Arial", size: 10 }
      nameCell.alignment = { horizontal: "left", vertical: "middle", indent: 1 }
      applyBorders(worksheet, currentRow, currentRow, 3, 8)

      // Col I: Valor (Total por ese servicio)
      const valCell = worksheet.getCell(`I${currentRow}`)
      valCell.value = item.total
      valCell.font = { name: "Arial", size: 10 }
      valCell.numFmt = '"$"#,##0'
      valCell.alignment = { horizontal: "right", vertical: "middle" }
      applyBorders(worksheet, currentRow, currentRow, 9, 9)

      currentRow++
    })
  }

  // 3. SECCIÓN DE TOTALES (Inmediatamente debajo del último servicio)
  const totalsData = [
    { label: "Total Neto", value: data.net },
    { label: "Descuento", value: data.discountValue },
    { label: "IVA", value: data.iva },
    { label: "Total final Cotización", value: data.finalTotal },
  ]

  totalsData.forEach((tot) => {
    const row = worksheet.getRow(currentRow)
    row.height = 20

    // Col C:H combinadas para el texto del total
    worksheet.mergeCells(`C${currentRow}:H${currentRow}`)
    const labelCell = worksheet.getCell(`C${currentRow}`)
    labelCell.value = tot.label
    labelCell.font = { name: "Arial", size: 10, bold: true }
    labelCell.alignment = { horizontal: "right", vertical: "middle" }
    applyBorders(worksheet, currentRow, currentRow, 3, 8)

    // Col I para el monto con formato Moneda
    const valCell = worksheet.getCell(`I${currentRow}`)
    valCell.value = tot.value
    valCell.font = { name: "Arial", size: 10, bold: true }
    valCell.numFmt = '"$"#,##0'
    valCell.alignment = { horizontal: "right", vertical: "middle" }
    applyBorders(worksheet, currentRow, currentRow, 9, 9)

    currentRow++
  })

  // 4. PIE DE PÁGINA FIJO (Tablas de pago)
  // Deja 2 filas en blanco
  currentRow += 2

  // Tabla: DATOS ORDEN DE COMPRA
  const ocRows = [
    { label: "Razón Social", value: "Angélica Andrea Soto Lazo" },
    { label: "Rut", value: "12.243.822-8" },
    { label: "Dirección", value: "San Alfonso 1784, Santiago" },
    { label: "Giro", value: "Eventos / Banquetería" },
  ]

  // Header tabla OC
  worksheet.mergeCells(`C${currentRow}:H${currentRow}`)
  const ocHeaderCell = worksheet.getCell(`C${currentRow}`)
  ocHeaderCell.value = "DATOS ORDEN DE COMPRA"
  ocHeaderCell.font = { name: "Arial", size: 10, bold: true }
  ocHeaderCell.alignment = { horizontal: "center", vertical: "middle" }
  applyBorders(worksheet, currentRow, currentRow, 3, 8)
  worksheet.getRow(currentRow).height = 20
  currentRow++

  ocRows.forEach((item) => {
    const row = worksheet.getRow(currentRow)
    row.height = 19

    // Col C a E para la etiqueta
    worksheet.mergeCells(`C${currentRow}:E${currentRow}`)
    const labelCell = worksheet.getCell(`C${currentRow}`)
    labelCell.value = item.label
    labelCell.font = { name: "Arial", size: 10, bold: true }
    labelCell.alignment = { horizontal: "left", vertical: "middle", indent: 1 }
    applyBorders(worksheet, currentRow, currentRow, 3, 5)

    // Col F a H para el valor
    worksheet.mergeCells(`F${currentRow}:H${currentRow}`)
    const valCell = worksheet.getCell(`F${currentRow}`)
    valCell.value = item.value
    valCell.font = { name: "Arial", size: 10 }
    valCell.alignment = { horizontal: "left", vertical: "middle", indent: 1 }
    applyBorders(worksheet, currentRow, currentRow, 6, 8)

    currentRow++
  })

  // Deja 1 fila en blanco
  currentRow += 1

  // Tabla: DATOS DE TRANSFERENCIA
  const transferRows = [
    { label: "Cta Vista Ch/Electronica", value: "21670205271" },
    { label: "Banco", value: "Estado" },
    { label: "A nombre de", value: "Angélica Andrea Soto Lazo" },
    { label: "Rut", value: "12.243.822-8" },
    { label: "Mail de Confirmación", value: "info@tijerales.cl" },
  ]

  // Header tabla Transferencia
  worksheet.mergeCells(`C${currentRow}:H${currentRow}`)
  const transHeaderCell = worksheet.getCell(`C${currentRow}`)
  transHeaderCell.value = "DATOS DE TRANSFERENCIA"
  transHeaderCell.font = { name: "Arial", size: 10, bold: true }
  transHeaderCell.alignment = { horizontal: "center", vertical: "middle" }
  applyBorders(worksheet, currentRow, currentRow, 3, 8)
  worksheet.getRow(currentRow).height = 20
  currentRow++

  transferRows.forEach((item) => {
    const row = worksheet.getRow(currentRow)
    row.height = 19

    // Col C a E para la etiqueta
    worksheet.mergeCells(`C${currentRow}:E${currentRow}`)
    const labelCell = worksheet.getCell(`C${currentRow}`)
    labelCell.value = item.label
    labelCell.font = { name: "Arial", size: 10, bold: true }
    labelCell.alignment = { horizontal: "left", vertical: "middle", indent: 1 }
    applyBorders(worksheet, currentRow, currentRow, 3, 5)

    // Col F a H para el valor
    worksheet.mergeCells(`F${currentRow}:H${currentRow}`)
    const valCell = worksheet.getCell(`F${currentRow}`)
    valCell.value = item.value
    valCell.font = { name: "Arial", size: 10 }
    valCell.alignment = { horizontal: "left", vertical: "middle", indent: 1 }
    applyBorders(worksheet, currentRow, currentRow, 6, 8)

    currentRow++
  })

  // Generar y descargar archivo XLSX
  const filename = `Cotizacion-Tijerales-${safeFilePart(data.company, "cliente")}-${safeFilePart(data.date, "fecha")}.xlsx`

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
  saveAs(blob, filename)
}

