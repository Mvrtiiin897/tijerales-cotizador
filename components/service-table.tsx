"use client"

import { Minus, Plus } from "lucide-react"
import type { Category } from "@/lib/cotizador-data"
import { formatCLP } from "@/lib/cotizador-data"
import { cn } from "@/lib/utils"

type ServiceTableProps = {
  category: Category
  quantities: Record<string, number>
  onChange: (itemId: string, quantity: number) => void
}

export function ServiceTable({ category, quantities, onChange }: ServiceTableProps) {
  const Icon = category.icon
  const titleColor =
    category.id === "menus"
      ? "text-cat-menus"
      : category.id === "toldos"
        ? "text-cat-toldos"
        : "text-foreground"

  return (
    <section className="rounded-xl border border-panel-line bg-card shadow-sm">
      <header className="flex items-center gap-2 px-5 pt-4 pb-3">
        <Icon className={cn("size-6", titleColor)} strokeWidth={2.5} />
        <h2 className={cn("text-xl font-extrabold tracking-tight", titleColor)}>{category.label}</h2>
      </header>

      {/* column headers */}
      <div className="mx-4 grid grid-cols-[1fr_140px_170px_90px] items-center rounded-md bg-brand-navy px-4 py-2 text-xs font-bold tracking-wide text-white">
        <span>SERVICIO</span>
        <span className="text-right">PRECIO UNITARIO</span>
        <span className="text-center">CANTIDAD</span>
        <span className="text-right">TOTAL</span>
      </div>

      <div className="px-4 pb-4">
        {category.items.map((item, index) => {
          const qty = quantities[item.id] ?? 0
          const lineTotal = qty * item.price
          return (
            <div
              key={item.id}
              className={cn(
                "grid grid-cols-[1fr_140px_170px_90px] items-center py-3",
                index !== category.items.length - 1 && "border-b border-panel-line",
              )}
            >
              <div className="pr-2">
                <p className="font-bold text-foreground">{item.name}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>

              <span className="text-right font-semibold text-foreground">{formatCLP(item.price)}</span>

              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  aria-label={`Restar ${item.name}`}
                  onClick={() => onChange(item.id, Math.max(0, qty - 1))}
                  className="flex size-9 items-center justify-center rounded-md bg-muted text-foreground transition-colors hover:bg-muted-foreground/20 active:translate-y-px"
                >
                  <Minus className="size-4" strokeWidth={3} />
                </button>

                <input
                  type="number"
                  min={0}
                  aria-label={`Cantidad de ${item.name}`}
                  value={qty}
                  onChange={(e) => {
                    const parsed = Number.parseInt(e.target.value, 10)
                    onChange(item.id, Number.isNaN(parsed) || parsed < 0 ? 0 : parsed)
                  }}
                  className="h-9 w-14 rounded-md border border-panel-line bg-background text-center font-semibold text-foreground outline-none focus-visible:border-brand-accent focus-visible:ring-2 focus-visible:ring-brand-accent/30 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />

                <button
                  type="button"
                  aria-label={`Sumar ${item.name}`}
                  onClick={() => onChange(item.id, qty + 1)}
                  className="flex size-9 items-center justify-center rounded-md bg-brand-accent text-white transition-colors hover:bg-brand-navy active:translate-y-px"
                >
                  <Plus className="size-4" strokeWidth={3} />
                </button>
              </div>

              <span className="text-right font-bold text-foreground">{formatCLP(lineTotal)}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
