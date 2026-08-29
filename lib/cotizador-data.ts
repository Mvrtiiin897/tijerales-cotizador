import type { LucideIcon } from "lucide-react"
import { Utensils, Tent, Mic, Castle, Plus, FileText } from "lucide-react"

export type ServiceItem = {
  id: string
  name: string
  description: string
  price: number
}

export type Category = {
  id: string
  label: string
  tabLabel: string
  color: string // tailwind bg class token
  icon: LucideIcon
  items: ServiceItem[]
}

export const CATEGORIES: Category[] = [
  {
    id: "menus",
    label: "MENÚS",
    tabLabel: "MENÚS",
    color: "bg-cat-menus",
    icon: Utensils,
    items: [
      { id: "menu-popular", name: "MENÚ POPULAR", description: "Plato de fondo + postre", price: 23000 },
      { id: "menu-clasico-1", name: "MENÚ CLÁSICO 1", description: "Entrada + plato de fondo + postre", price: 25000 },
      { id: "menu-clasico-2", name: "MENÚ CLÁSICO 2", description: "Entrada + plato de fondo + postre", price: 27000 },
      { id: "menu-especial", name: "MENÚ ESPECIAL", description: "Entrada + plato de fondo + postre", price: 33000 },
    ],
  },
  {
    id: "toldos",
    label: "TOLDOS Y PISOS",
    tabLabel: "TOLDOS Y PISOS",
    color: "bg-cat-toldos",
    icon: Tent,
    items: [
      { id: "toldo-basico", name: "TOLDO BÁSICO", description: "Servicio por m2", price: 4500 },
      { id: "carpa-premium", name: "CARPA PREMIUM", description: "Servicio por m2", price: 5500 },
      { id: "cubre-piso", name: "CUBRE PISO", description: "Servicio por m2", price: 1500 },
    ],
  },
  {
    id: "shows",
    label: "SHOWS",
    tabLabel: "SHOWS",
    color: "bg-cat-shows",
    icon: Mic,
    items: [
      { id: "dj-profesional", name: "DJ PROFESIONAL", description: "Servicio 4 horas", price: 150000 },
      { id: "banda-vivo", name: "BANDA EN VIVO", description: "Servicio 3 horas", price: 450000 },
      { id: "animacion", name: "ANIMACIÓN", description: "Servicio por hora", price: 40000 },
    ],
  },
  {
    id: "juegos",
    label: "JUEGOS",
    tabLabel: "JUEGOS",
    color: "bg-cat-juegos",
    icon: Castle,
    items: [
      { id: "inflable", name: "JUEGO INFLABLE", description: "Arriendo por día", price: 80000 },
      { id: "cama-elastica", name: "CAMA ELÁSTICA", description: "Arriendo por día", price: 60000 },
      { id: "set-juegos", name: "SET DE JUEGOS", description: "Juegos tradicionales", price: 35000 },
    ],
  },
  {
    id: "otros",
    label: "OTROS",
    tabLabel: "OTROS",
    color: "bg-cat-otros",
    icon: Plus,
    items: [
      { id: "iluminacion", name: "ILUMINACIÓN", description: "Servicio por evento", price: 90000 },
      { id: "generador", name: "GENERADOR ELÉCTRICO", description: "Arriendo por día", price: 120000 },
      { id: "seguridad", name: "SEGURIDAD", description: "Guardia por turno", price: 55000 },
    ],
  },
  {
    id: "resumen",
    label: "RESUMEN",
    tabLabel: "RESUMEN",
    color: "bg-cat-resumen",
    icon: FileText,
    items: [],
  },
]

export function formatCLP(value: number): string {
  const sign = value < 0 ? "-" : ""
  return `${sign}$${Math.abs(Math.round(value)).toLocaleString("es-CL")}`
}
