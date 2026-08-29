"use client"

import { FileText, Printer, Save, Trash2 } from "lucide-react"
import { formatCLP } from "@/lib/cotizador-data"

type SummaryPanelProps = {
  net: number
  iva: number
  discountValue: number
  netWithDiscount: number
  finalTotal: number
  isDiscountActive: boolean
  onClear: () => void
  onGenerate: () => void
}

export function SummaryPanel({
  net,
  iva,
  discountValue,
  netWithDiscount,
  finalTotal,
  isDiscountActive,
  onClear,
  onGenerate,
}: SummaryPanelProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* RESUMEN DE COTIZACIÓN */}
      <section className="rounded-xl border border-panel-line bg-card shadow-sm">
        <header className="rounded-t-xl bg-brand-navy px-4 py-3">
          <h2 className="text-base font-bold tracking-wide text-white">RESUMEN DE COTIZACIÓN</h2>
        </header>
        <div className="flex flex-col gap-3.5 p-4">
          {/* TOTAL NETO */}
          <Row label="TOTAL NETO" value={formatCLP(net)} labelClass="text-brand-navy" />

          {isDiscountActive ? (
            <>
              <div className="h-px bg-panel-line" />
              {/* DESCUENTO */}
              <Row
                label="DESCUENTO"
                value={formatCLP(-discountValue)}
                labelClass="text-quote-green"
                valueClass="text-quote-green"
              />
              <div className="h-px bg-panel-line" />
              {/* TOTAL CON DESCUENTO */}
              <Row
                label="TOTAL CON DESCUENTO"
                value={formatCLP(netWithDiscount)}
                labelClass="text-brand-navy"
              />
              <div className="h-px bg-panel-line" />
              {/* IVA (19%) sobre el total con descuento */}
              <Row label="IVA (19%)" value={formatCLP(iva)} labelClass="text-muted-foreground" />
            </>
          ) : (
            <>
              <div className="h-px bg-panel-line" />
              {/* IVA (19%) sobre el neto directo */}
              <Row label="IVA (19%)" value={formatCLP(iva)} labelClass="text-muted-foreground" />
            </>
          )}

          <div className="h-px bg-panel-line" />

          <div className="flex items-center justify-between rounded-lg bg-brand-navy px-4 py-3.5 text-white shadow-inner">
            <span className="text-lg font-extrabold tracking-wide">TOTAL FINAL</span>
            <span className="text-2xl font-extrabold">{formatCLP(finalTotal)}</span>
          </div>
        </div>
      </section>

      {/* ACTIONS */}
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onGenerate}
          className="flex items-center justify-center gap-3 rounded-xl bg-quote-green px-4 py-4 text-white shadow-sm transition-colors hover:bg-quote-green-dark active:translate-y-px"
        >
          <FileText className="size-6" />
          <span className="text-base font-bold tracking-wide text-balance">GENERAR COTIZACIÓN</span>
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center justify-center gap-3 rounded-xl border border-panel-line bg-card px-4 py-3.5 text-foreground shadow-sm transition-colors hover:bg-muted active:translate-y-px"
        >
          <Printer className="size-5 text-brand-navy" />
          <span className="text-base font-bold tracking-wide text-brand-navy">IMPRIMIR</span>
        </button>

        <button
          type="button"
          onClick={onGenerate}
          className="flex items-center justify-center gap-3 rounded-xl border border-panel-line bg-card px-4 py-3.5 text-foreground shadow-sm transition-colors hover:bg-muted active:translate-y-px"
        >
          <Save className="size-5 text-brand-navy" />
          <span className="text-base font-bold tracking-wide text-brand-navy">GUARDAR COTIZACIÓN</span>
        </button>

        <button
          type="button"
          onClick={onClear}
          className="flex items-center justify-center gap-3 rounded-xl border border-panel-line bg-card px-4 py-3.5 text-foreground shadow-sm transition-colors hover:bg-destructive/10 active:translate-y-px"
        >
          <Trash2 className="size-5 text-destructive" />
          <span className="text-base font-bold tracking-wide text-destructive">LIMPIAR TODO</span>
        </button>
      </div>
    </div>
  )
}

function Row({
  label,
  value,
  labelClass,
  valueClass,
}: {
  label: string
  value: string
  labelClass?: string
  valueClass?: string
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-base font-bold tracking-wide ${labelClass ?? "text-foreground"}`}>{label}</span>
      <span className={`text-lg font-extrabold ${valueClass ?? "text-foreground"}`}>{value}</span>
    </div>
  )
}
