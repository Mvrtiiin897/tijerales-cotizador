"use client"

import { CATEGORIES } from "@/lib/cotizador-data"
import { cn } from "@/lib/utils"

type CategoryTabsProps = {
  active: string
  onSelect: (id: string) => void
}

export function CategoryTabs({ active, onSelect }: CategoryTabsProps) {
  return (
    <div className="grid grid-cols-6 gap-3">
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon
        const isActive = active === cat.id
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            className={cn(
              "relative flex flex-col items-center justify-center gap-2 rounded-xl px-2 py-5 text-white shadow-sm transition-all",
              cat.color,
              isActive ? "ring-2 ring-white/70 ring-offset-2 ring-offset-app-canvas" : "opacity-95 hover:opacity-100",
            )}
          >
            <Icon className="size-7" strokeWidth={2.2} />
            <span className="text-center text-sm font-bold leading-tight tracking-wide text-balance">
              {cat.tabLabel}
            </span>
            {isActive && (
              <span
                aria-hidden
                className={cn(
                  "absolute -bottom-2 left-1/2 size-4 -translate-x-1/2 rotate-45 rounded-[3px]",
                  cat.color,
                )}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
