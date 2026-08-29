import type { LucideIcon } from "lucide-react"
import {
  Utensils,
  Tent,
  Mic,
  Castle,
  Plus,
  FileText,
  Music,
  Sparkles,
  Truck,
  Wine,
  Shield,
  Lightbulb,
  Layers,
  Tag,
  Volume2,
  Camera,
  Coffee,
  Gift,
  DollarSign,
  Package,
  Wrench,
  Users,
  Flame,
  Speaker,
} from "lucide-react"

export type ServiceItem = {
  id: string
  name: string
  description: string
  price: number
  active?: boolean
}

export type Category = {
  id: string
  label: string
  tabLabel: string
  color: string // tailwind bg class token or hex/css color
  iconName?: string
  icon?: LucideIcon
  items: ServiceItem[]
}

// Icon dictionary for serialization and selection
export const ICON_MAP: Record<string, LucideIcon> = {
  Utensils,
  Tent,
  Mic,
  Castle,
  Plus,
  FileText,
  Music,
  Sparkles,
  Truck,
  Wine,
  Shield,
  Lightbulb,
  Layers,
  Tag,
  Volume2,
  Camera,
  Coffee,
  Gift,
  DollarSign,
  Package,
  Wrench,
  Users,
  Flame,
  Speaker,
}

export function getCategoryIcon(catOrName?: Category | string): LucideIcon {
  if (!catOrName) return Tag
  if (typeof catOrName === "object") {
    if (catOrName.icon) return catOrName.icon
    if (catOrName.iconName && ICON_MAP[catOrName.iconName]) {
      return ICON_MAP[catOrName.iconName]
    }
    // Fallback based on id
    switch (catOrName.id) {
      case "menus":
        return Utensils
      case "toldos":
        return Tent
      case "shows":
        return Mic
      case "juegos":
        return Castle
      case "otros":
        return Plus
      case "resumen":
        return FileText
      default:
        return Tag
    }
  }

  return ICON_MAP[catOrName] || Tag
}

// Palette presets for category coloring
export const COLOR_PRESETS = [
  { label: "Azul Menú", class: "bg-cat-menus", hex: "#1b4e8f" },
  { label: "Verde Toldos", class: "bg-cat-toldos", hex: "#3f9142" },
  { label: "Dorado Shows", class: "bg-cat-shows", hex: "#f0b323" },
  { label: "Naranja Juegos", class: "bg-cat-juegos", hex: "#ec8a2e" },
  { label: "Púrpura Otros", class: "bg-cat-otros", hex: "#5f4a9c" },
  { label: "Magenta Fiesta", class: "bg-pink-600", hex: "#db2777" },
  { label: "Cian Evento", class: "bg-cyan-600", hex: "#0891b2" },
  { label: "Rojo Intenso", class: "bg-red-600", hex: "#dc2626" },
  { label: "Esmeralda", class: "bg-emerald-600", hex: "#059669" },
  { label: "Gris Grafito", class: "bg-slate-700", hex: "#334155" },
]

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "menus",
    label: "MENÚS",
    tabLabel: "MENÚS",
    color: "bg-cat-menus",
    iconName: "Utensils",
    icon: Utensils,
    items: [
      { id: "menu-popular", name: "MENÚ POPULAR", description: "Plato de fondo + postre", price: 23000, active: true },
      { id: "menu-clasico-1", name: "MENÚ CLÁSICO 1", description: "Entrada + plato de fondo + postre", price: 25000, active: true },
      { id: "menu-clasico-2", name: "MENÚ CLÁSICO 2", description: "Entrada + plato de fondo + postre", price: 27000, active: true },
      { id: "menu-especial", name: "MENÚ ESPECIAL", description: "Entrada + plato de fondo + postre", price: 33000, active: true },
    ],
  },
  {
    id: "toldos",
    label: "TOLDOS Y PISOS",
    tabLabel: "TOLDOS Y PISOS",
    color: "bg-cat-toldos",
    iconName: "Tent",
    icon: Tent,
    items: [
      { id: "toldo-basico", name: "TOLDO BÁSICO", description: "Servicio por m2", price: 4500, active: true },
      { id: "carpa-premium", name: "CARPA PREMIUM", description: "Servicio por m2", price: 5500, active: true },
      { id: "cubre-piso", name: "CUBRE PISO", description: "Servicio por m2", price: 1500, active: true },
    ],
  },
  {
    id: "shows",
    label: "SHOWS",
    tabLabel: "SHOWS",
    color: "bg-cat-shows",
    iconName: "Mic",
    icon: Mic,
    items: [
      { id: "dj-profesional", name: "DJ PROFESIONAL", description: "Servicio 4 horas", price: 150000, active: true },
      { id: "banda-vivo", name: "BANDA EN VIVO", description: "Servicio 3 horas", price: 450000, active: true },
      { id: "animacion", name: "ANIMACIÓN", description: "Servicio por hora", price: 40000, active: true },
    ],
  },
  {
    id: "juegos",
    label: "JUEGOS",
    tabLabel: "JUEGOS",
    color: "bg-cat-juegos",
    iconName: "Castle",
    icon: Castle,
    items: [
      { id: "inflable", name: "JUEGO INFLABLE", description: "Arriendo por día", price: 80000, active: true },
      { id: "cama-elastica", name: "CAMA ELÁSTICA", description: "Arriendo por día", price: 60000, active: true },
      { id: "set-juegos", name: "SET DE JUEGOS", description: "Juegos tradicionales", price: 35000, active: true },
    ],
  },
  {
    id: "otros",
    label: "OTROS",
    tabLabel: "OTROS",
    color: "bg-cat-otros",
    iconName: "Plus",
    icon: Plus,
    items: [
      { id: "iluminacion", name: "ILUMINACIÓN", description: "Servicio por evento", price: 90000, active: true },
      { id: "generador", name: "GENERADOR ELÉCTRICO", description: "Arriendo por día", price: 120000, active: true },
      { id: "seguridad", name: "SEGURIDAD", description: "Guardia por turno", price: 55000, active: true },
    ],
  },
]

export const RESUMEN_TAB_CATEGORY: Category = {
  id: "resumen",
  label: "RESUMEN",
  tabLabel: "RESUMEN",
  color: "bg-cat-resumen",
  iconName: "FileText",
  icon: FileText,
  items: [],
}

export const CATEGORIES: Category[] = [...DEFAULT_CATEGORIES, RESUMEN_TAB_CATEGORY]

export function formatCLP(value: number): string {
  const sign = value < 0 ? "-" : ""
  return `${sign}$${Math.abs(Math.round(value)).toLocaleString("es-CL")}`
}
