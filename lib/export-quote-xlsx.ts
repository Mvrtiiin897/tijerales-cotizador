import * as XLSXModule from "xlsx"
import { CATEGORIES } from "@/lib/cotizador-data"

type XlsxLib = typeof XLSXModule

function getXlsx(): XlsxLib {
  const mod = XLSXModule as XlsxLib & { default?: XlsxLib }
  if (mod.utils && typeof mod.writeFile === "function") return mod
  if (mod.default?.utils && typeof mod.default.writeFile === "function") return mod.default
  throw new Error("No se pudo cargar SheetJS (xlsx)")
}

export type QuoteExportInput = {
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

function safeFilePart(value: string, fallback: string): string {
  const cleaned = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[<>:"/\\|?*]+/g, "")
    .trim()
    .replace(/\s+/g, "-")
  return cleaned || fallback
}

export function downloadQuoteXlsx(data: QuoteExportInput): void {
  const XLSX = getXlsx()
  const wb = XLSX.utils.book_new()
  const productCategories = CATEGORIES.filter((c) => c.id !== "resumen")

  const header = ["Categoría", "Servicio", "Descripción", "Precio unitario", "Cantidad", "Total"]
  const serviceRows = productCategories.flatMap((cat) =>
    cat.items.map((item) => {
      const qty = data.quantities[item.id] ?? 0
      return [cat.label, item.name, item.description, item.price, qty, qty * item.price]
    }),
  )

  const discountDisplay = data.isPercent
    ? `${data.discount || "0"}%`
    : `$${(Number.parseFloat(data.discount) || 0).toLocaleString("es-CL")}`

  const sheetData: (string | number)[][] = [
    ["TIJERALES ESTRUCTURAS & EVENTOS"],
    ["DESGLOSE FORMAL – COTIZACIÓN 2026"],
    [],
    ["DATOS DEL CLIENTE"],
    ["Nombre / Empresa", data.company || "No especificado"],
    ["Fecha de cotización", data.date || "—"],
    ["Datos OC / Banco transferencia", data.ocData || "—"],
    ["Observaciones", data.observations || "—"],
    ["Descuento ingresado", discountDisplay],
    ["Tipo de descuento", data.isPercent ? "Porcentaje (%)" : "Monto fijo ($)"],
    [],
    ["DETALLE DE SERVICIOS"],
    header,
    ...serviceRows,
    [],
    ["RESUMEN DE COTIZACIÓN"],
    ["Total neto", data.net],
    ["IVA (19%)", data.iva],
    ["Descuento aplicado", data.discountValue],
    ["TOTAL FINAL", data.finalTotal],
  ]

  const ws = XLSX.utils.aoa_to_sheet(sheetData)
  ws["!cols"] = [
    { wch: 26 },
    { wch: 34 },
    { wch: 44 },
    { wch: 18 },
    { wch: 12 },
    { wch: 18 },
  ]

  const clpFormat = '"$"#,##0'
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1")
  for (let r = range.s.r; r <= range.e.r; r++) {
    const row = sheetData[r]
    if (!row) continue
    if (row[0] === "Categoría") continue
    for (const c of [3, 5]) {
      const cell = ws[XLSX.utils.encode_cell({ r, c })]
      if (cell && typeof cell.v === "number") {
        cell.t = "n"
        cell.z = clpFormat
      }
    }
  }

  for (const label of ["Total neto", "IVA (19%)", "Descuento aplicado", "TOTAL FINAL"]) {
    const rowIndex = sheetData.findIndex((row) => row[0] === label)
    if (rowIndex >= 0) {
      const cell = ws[XLSX.utils.encode_cell({ r: rowIndex, c: 1 })]
      if (cell && typeof cell.v === "number") {
        cell.t = "n"
        cell.z = clpFormat
      }
    }
  }

  XLSX.utils.book_append_sheet(wb, ws, "Cotización")
  const filename = `Cotizacion-Tijerales-${safeFilePart(data.company, "cliente")}-${safeFilePart(data.date, "fecha")}.xlsx`

  try {
    XLSX.writeFile(wb, filename)
  } catch {
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" })
    const blob = new Blob([wbout], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
  }
}
