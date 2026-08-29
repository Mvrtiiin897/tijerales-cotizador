"use client"

import { User, Calendar, Percent } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

type ClientPanelProps = {
  company: string
  setCompany: (v: string) => void
  date: string
  setDate: (v: string) => void
  ocData: string
  setOcData: (v: string) => void
  discount: string
  setDiscount: (v: string) => void
  isPercent: boolean
  setIsPercent: (v: boolean) => void
  isDiscountActive: boolean
  setIsDiscountActive: (v: boolean) => void
  observations: string
  setObservations: (v: string) => void
}

function PanelHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <header className="flex items-center gap-2.5 rounded-t-xl bg-brand-navy px-4 py-3 text-white">
      <span className="flex size-6 items-center justify-center rounded-md bg-white/15">{icon}</span>
      <h2 className="text-base font-bold tracking-wide">{title}</h2>
    </header>
  )
}

export function ClientPanel(props: ClientPanelProps) {
  const {
    company,
    setCompany,
    date,
    setDate,
    ocData,
    setOcData,
    discount,
    setDiscount,
    isPercent,
    setIsPercent,
    isDiscountActive,
    setIsDiscountActive,
    observations,
    setObservations,
  } = props

  return (
    <div className="flex flex-col gap-5">
      {/* DATOS DEL CLIENTE */}
      <section className="rounded-xl border border-panel-line bg-card shadow-sm">
        <PanelHeader icon={<User className="size-4" />} title="DATOS DEL CLIENTE" />
        <div className="flex flex-col gap-4 p-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">Nombre / Empresa</label>
            <Input placeholder="Ej: Empresa XYZ" value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">Fecha</label>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="pl-9" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">Datos OC / Banco transferencia</label>
            <Textarea
              placeholder="Escribe aquí..."
              rows={4}
              value={ocData}
              onChange={(e) => setOcData(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* DESCUENTO GENERAL */}
      <section className="rounded-xl border border-panel-line bg-card shadow-sm">
        <PanelHeader icon={<Percent className="size-4" />} title="% DESCUENTO GENERAL" />
        <div className="flex flex-col gap-4 p-4">
          {/* Activar / Desactivar Descuento */}
          <div className="flex items-center justify-between rounded-lg border border-panel-line bg-muted/40 p-3">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">Aplicar Descuento</span>
              <span className="text-xs text-muted-foreground">
                {isDiscountActive ? "Descuento habilitado en cotización" : "Descuento desactivado"}
              </span>
            </div>
            <Switch checked={isDiscountActive} onCheckedChange={setIsDiscountActive} />
          </div>

          <div className={`flex flex-col gap-4 transition-opacity ${isDiscountActive ? "opacity-100" : "opacity-60"}`}>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">Descuento ({isPercent ? "%" : "$"})</label>
              <Input
                type="number"
                min={0}
                value={discount}
                disabled={!isDiscountActive}
                onChange={(e) => setDiscount(e.target.value)}
                className="bg-card"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">¿Descuento en %?</span>
              <Switch checked={isPercent} disabled={!isDiscountActive} onCheckedChange={setIsPercent} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">Observaciones</label>
            <Textarea
              placeholder="Escribe aquí..."
              rows={4}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              className="bg-card"
            />
          </div>
        </div>
      </section>
    </div>
  )
}
