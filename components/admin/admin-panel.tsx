"use client"

import { useState, useMemo } from "react"
import {
  ArrowLeft,
  Plus,
  Search,
  FolderPlus,
  RotateCcw,
  Edit2,
  Trash2,
  Layers,
  CheckCircle2,
  EyeOff,
  Eye,
  Settings,
  KeyRound,
  Download,
  Upload,
  AlertTriangle,
  X,
  Sparkles,
} from "lucide-react"
import {
  Category,
  ServiceItem,
  formatCLP,
  getCategoryIcon,
  ICON_MAP,
  COLOR_PRESETS,
} from "@/lib/cotizador-data"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type AdminPanelProps = {
  categories: Category[]
  stats: {
    totalCategories: number
    totalServices: number
    activeServices: number
    inactiveServices: number
  }
  onBack: () => void
  onAddCategory: (data: { label: string; tabLabel?: string; color: string; iconName?: string }) => void
  onUpdateCategory: (
    id: string,
    data: { label?: string; tabLabel?: string; color?: string; iconName?: string },
  ) => void
  onDeleteCategory: (id: string) => void
  onAddService: (data: {
    categoryId: string
    name: string
    description?: string
    price: number
    active?: boolean
  }) => void
  onUpdateService: (
    currentCategoryId: string,
    serviceId: string,
    data: {
      name?: string
      description?: string
      price?: number
      active?: boolean
      targetCategoryId?: string
    },
  ) => void
  onDeleteService: (categoryId: string, serviceId: string) => void
  onToggleServiceActive: (categoryId: string, serviceId: string) => void
  onResetToDefaults: () => void
  onPersistCategories: (categories: Category[]) => void
}

export function AdminPanel({
  categories,
  stats,
  onBack,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onAddService,
  onUpdateService,
  onDeleteService,
  onToggleServiceActive,
  onResetToDefaults,
  onPersistCategories,
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"services" | "categories" | "settings">("services")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")

  // Modals state
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<{
    service: ServiceItem
    categoryId: string
  } | null>(null)

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "service" | "category"
    id: string
    categoryId?: string
    name: string
  } | null>(null)

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false)

  // PIN settings
  const [customPin, setCustomPin] = useState("")
  const [pinMessage, setPinMessage] = useState("")

  // Filtered services list for table
  const filteredServices = useMemo(() => {
    const list: Array<{ service: ServiceItem; category: Category }> = []

    categories.forEach((cat) => {
      if (selectedCategoryFilter !== "all" && cat.id !== selectedCategoryFilter) {
        return
      }

      cat.items.forEach((item) => {
        // Status filter
        if (statusFilter === "active" && item.active === false) return
        if (statusFilter === "inactive" && item.active !== false) return

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase()
          const matchesName = item.name.toLowerCase().includes(q)
          const matchesDesc = item.description?.toLowerCase().includes(q)
          const matchesCat = cat.label.toLowerCase().includes(q)
          if (!matchesName && !matchesDesc && !matchesCat) return
        }

        list.push({ service: item, category: cat })
      })
    })

    return list
  }, [categories, selectedCategoryFilter, statusFilter, searchQuery])

  const handleOpenNewService = () => {
    setEditingService(null)
    setIsServiceModalOpen(true)
  }

  const handleOpenEditService = (service: ServiceItem, categoryId: string) => {
    setEditingService({ service, categoryId })
    setIsServiceModalOpen(true)
  }

  const handleOpenNewCategory = () => {
    setEditingCategory(null)
    setIsCategoryModalOpen(true)
  }

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory(cat)
    setIsCategoryModalOpen(true)
  }

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(categories, null, 2))
    const downloadAnchor = document.createElement("a")
    downloadAnchor.setAttribute("href", dataStr)
    downloadAnchor.setAttribute("download", `catalogo-tijerales-${new Date().toISOString().slice(0, 10)}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader()
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8")
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string) as Category[]
          if (Array.isArray(parsed) && parsed.length > 0) {
            onPersistCategories(parsed)
            alert("¡Catálogo importado exitosamente!")
          } else {
            alert("Formato de archivo inválido.")
          }
        } catch {
          alert("Error al leer el archivo JSON.")
        }
      }
    }
  }

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault()
    if (customPin.trim().length < 4) {
      setPinMessage("La clave debe tener al menos 4 caracteres.")
      return
    }
    localStorage.setItem("tijerales_admin_pin", customPin.trim())
    setPinMessage("¡Clave de administración actualizada correctamente!")
    setCustomPin("")
    setTimeout(() => setPinMessage(""), 4000)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-brand-navy p-6 shadow-xl text-white">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/20 active:translate-y-px"
          >
            <ArrowLeft className="size-4" />
            Volver al Cotizador
          </button>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Panel de Administración</h1>
            <p className="text-xs font-semibold text-white/70">
              Gestión dinámica de servicios, precios y categorías
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() => setIsResetConfirmOpen(true)}
            variant="ghost"
            size="sm"
            className="text-white/80 hover:bg-white/10 hover:text-white gap-2 border border-white/15"
          >
            <RotateCcw className="size-4 text-amber-400" />
            Restablecer Valores
          </Button>

          <Button
            onClick={handleExportJson}
            variant="ghost"
            size="sm"
            className="text-white/80 hover:bg-white/10 hover:text-white gap-2 border border-white/15"
          >
            <Download className="size-4 text-cyan-400" />
            Exportar Catálogo
          </Button>

          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white">
            <Upload className="size-4 text-emerald-400" />
            Importar Catálogo
            <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
          </label>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="flex flex-col rounded-xl border border-panel-line bg-card p-4 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground">Categorías</span>
          <span className="text-2xl font-extrabold text-foreground">{stats.totalCategories}</span>
        </div>
        <div className="flex flex-col rounded-xl border border-panel-line bg-card p-4 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground">Servicios Totales</span>
          <span className="text-2xl font-extrabold text-foreground">{stats.totalServices}</span>
        </div>
        <div className="flex flex-col rounded-xl border border-panel-line bg-card p-4 shadow-sm">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
            <CheckCircle2 className="size-3.5" />
            Servicios Activos
          </span>
          <span className="text-2xl font-extrabold text-emerald-600">{stats.activeServices}</span>
        </div>
        <div className="flex flex-col rounded-xl border border-panel-line bg-card p-4 shadow-sm">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <EyeOff className="size-3.5 text-muted-foreground" />
            Servicios Ocultos
          </span>
          <span className="text-2xl font-extrabold text-muted-foreground">{stats.inactiveServices}</span>
        </div>
      </div>

      {/* Main Admin Tabs */}
      <div className="flex border-b border-panel-line">
        <button
          type="button"
          onClick={() => setActiveTab("services")}
          className={cn(
            "flex items-center gap-2 border-b-2 px-6 py-3 font-bold text-sm transition-all",
            activeTab === "services"
              ? "border-brand-navy text-brand-navy"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <Layers className="size-4" />
          Servicios y Precios ({stats.totalServices})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("categories")}
          className={cn(
            "flex items-center gap-2 border-b-2 px-6 py-3 font-bold text-sm transition-all",
            activeTab === "categories"
              ? "border-brand-navy text-brand-navy"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <FolderPlus className="size-4" />
          Categorías ({stats.totalCategories})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("settings")}
          className={cn(
            "flex items-center gap-2 border-b-2 px-6 py-3 font-bold text-sm transition-all",
            activeTab === "settings"
              ? "border-brand-navy text-brand-navy"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <Settings className="size-4" />
          Seguridad & Clave
        </button>
      </div>

      {/* TAB 1: SERVICES MANAGEMENT */}
      {activeTab === "services" && (
        <div className="flex flex-col gap-5">
          {/* Filter and Create Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-panel-line bg-card p-4 shadow-sm">
            <div className="flex flex-1 flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar servicio..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground focus-visible:border-brand-accent focus-visible:outline-none"
              >
                <option value="all">Todas las Categorías</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground focus-visible:border-brand-accent focus-visible:outline-none"
              >
                <option value="all">Todos los Estados</option>
                <option value="active">Solo Activos</option>
                <option value="inactive">Solo Ocultos/Inactivos</option>
              </select>
            </div>

            <Button
              onClick={handleOpenNewService}
              className="bg-quote-green hover:bg-quote-green-dark text-white font-bold gap-2 px-4 shadow-sm"
            >
              <Plus className="size-4" />
              Nuevo Servicio
            </Button>
          </div>

          {/* Services Table */}
          <div className="overflow-hidden rounded-xl border border-panel-line bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-brand-navy text-xs font-bold uppercase tracking-wider text-white">
                  <tr>
                    <th className="px-5 py-3.5">Categoría</th>
                    <th className="px-5 py-3.5">Servicio</th>
                    <th className="px-5 py-3.5">Descripción</th>
                    <th className="px-5 py-3.5 text-right">Precio Unitario</th>
                    <th className="px-5 py-3.5 text-center">Estado (Visible)</th>
                    <th className="px-5 py-3.5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-panel-line">
                  {filteredServices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-muted-foreground">
                        No se encontraron servicios con los filtros seleccionados.
                      </td>
                    </tr>
                  ) : (
                    filteredServices.map(({ service, category }) => {
                      const CatIcon = getCategoryIcon(category)
                      const isActive = service.active !== false

                      return (
                        <tr
                          key={service.id}
                          className={cn(
                            "transition-colors hover:bg-muted/50",
                            !isActive && "bg-muted/20 opacity-75",
                          )}
                        >
                          {/* Categoría */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold text-white shadow-xs",
                                category.color || "bg-brand-navy",
                              )}
                            >
                              <CatIcon className="size-3" />
                              {category.label}
                            </span>
                          </td>

                          {/* Nombre */}
                          <td className="px-5 py-4 font-bold text-foreground">
                            <div className="flex items-center gap-2">
                              <span>{service.name}</span>
                              {!isActive && (
                                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                                  Oculto
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Descripción */}
                          <td className="px-5 py-4 text-muted-foreground max-w-xs truncate">
                            {service.description || "—"}
                          </td>

                          {/* Precio */}
                          <td className="px-5 py-4 text-right font-extrabold text-foreground whitespace-nowrap">
                            {formatCLP(service.price)}
                          </td>

                          {/* Toggle Active */}
                          <td className="px-5 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Switch
                                checked={isActive}
                                onCheckedChange={() => onToggleServiceActive(category.id, service.id)}
                              />
                              <span
                                className={cn(
                                  "text-xs font-semibold select-none",
                                  isActive ? "text-quote-green" : "text-muted-foreground",
                                )}
                              >
                                {isActive ? "Activo" : "Inactivo"}
                              </span>
                            </div>
                          </td>

                          {/* Acciones */}
                          <td className="px-5 py-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                title="Editar Servicio"
                                onClick={() => handleOpenEditService(service, category.id)}
                                className="flex size-8 items-center justify-center rounded-lg text-brand-navy hover:bg-brand-navy/10 transition-colors"
                              >
                                <Edit2 className="size-4" />
                              </button>
                              <button
                                type="button"
                                title="Eliminar Servicio"
                                onClick={() =>
                                  setDeleteConfirm({
                                    type: "service",
                                    id: service.id,
                                    categoryId: category.id,
                                    name: service.name,
                                  })
                                }
                                className="flex size-8 items-center justify-center rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CATEGORIES MANAGEMENT */}
      {activeTab === "categories" && (
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">Categorías del Catálogo</h2>
              <p className="text-xs text-muted-foreground">
                Crea nuevas secciones o modifica las existentes para agrupar servicios
              </p>
            </div>
            <Button
              onClick={handleOpenNewCategory}
              className="bg-quote-green hover:bg-quote-green-dark text-white font-bold gap-2 px-4 shadow-sm"
            >
              <Plus className="size-4" />
              Nueva Categoría
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const Icon = getCategoryIcon(category)
              const activeCount = category.items.filter((i) => i.active !== false).length

              return (
                <div
                  key={category.id}
                  className="flex flex-col overflow-hidden rounded-xl border border-panel-line bg-card shadow-sm transition-all hover:shadow-md"
                >
                  {/* Category Header with Color */}
                  <div
                    className={cn(
                      "flex items-center justify-between px-5 py-4 text-white",
                      category.color || "bg-brand-navy",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-white/20">
                        <Icon className="size-6" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base tracking-wide">{category.label}</h3>
                        <span className="text-xs text-white/80">Pestaña: {category.tabLabel}</span>
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col justify-between p-5 gap-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground font-medium">Servicios asociados:</span>
                      <span className="font-bold text-foreground">
                        {category.items.length} ({activeCount} activos)
                      </span>
                    </div>

                    <div className="flex items-center justify-end gap-2 border-t border-panel-line pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEditCategory(category)}
                        className="gap-1.5 text-brand-navy border-brand-navy/30 hover:bg-brand-navy/10"
                      >
                        <Edit2 className="size-3.5" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setDeleteConfirm({
                            type: "category",
                            id: category.id,
                            name: category.label,
                          })
                        }
                        className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                      >
                        <Trash2 className="size-3.5" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* TAB 3: SETTINGS & SECURITY */}
      {activeTab === "settings" && (
        <div className="max-w-xl rounded-xl border border-panel-line bg-card p-6 shadow-sm flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-bold text-foreground">Seguridad del Panel</h2>
            <p className="text-xs text-muted-foreground">
              Configura la clave de acceso para proteger la edición de precios y catálogo
            </p>
          </div>

          <form onSubmit={handleSavePin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">Nueva Clave de Administrador</label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Mínimo 4 caracteres..."
                  value={customPin}
                  onChange={(e) => setCustomPin(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {pinMessage && (
              <p
                className={cn(
                  "text-xs font-semibold",
                  pinMessage.includes("correctamente") ? "text-quote-green" : "text-destructive",
                )}
              >
                {pinMessage}
              </p>
            )}

            <Button type="submit" className="bg-brand-navy hover:bg-brand-navy-dark text-white font-bold w-fit">
              Actualizar Clave
            </Button>
          </form>

          <div className="border-t border-panel-line pt-4 flex flex-col gap-2">
            <h3 className="text-sm font-bold text-foreground">Restablecimiento de fábrica</h3>
            <p className="text-xs text-muted-foreground">
              Restaura todos los servicios, categorías y precios originales de Tijerales 2026.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsResetConfirmOpen(true)}
              className="w-fit text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              Restablecer todo a valores iniciales
            </Button>
          </div>
        </div>
      )}

      {/* SERVICE MODAL (CREATE / EDIT) */}
      {isServiceModalOpen && (
        <ServiceModal
          categories={categories}
          initialData={editingService}
          onClose={() => setIsServiceModalOpen(false)}
          onSave={(data) => {
            if (editingService) {
              onUpdateService(editingService.categoryId, editingService.service.id, {
                name: data.name,
                description: data.description,
                price: data.price,
                active: data.active,
                targetCategoryId: data.categoryId,
              })
            } else {
              onAddService({
                categoryId: data.categoryId,
                name: data.name,
                description: data.description,
                price: data.price,
                active: data.active,
              })
            }
            setIsServiceModalOpen(false)
          }}
        />
      )}

      {/* CATEGORY MODAL (CREATE / EDIT) */}
      {isCategoryModalOpen && (
        <CategoryModal
          initialData={editingCategory}
          onClose={() => setIsCategoryModalOpen(false)}
          onSave={(data) => {
            if (editingCategory) {
              onUpdateCategory(editingCategory.id, data)
            } else {
              onAddCategory(data)
            }
            setIsCategoryModalOpen(false)
          }}
        />
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-panel-line bg-card shadow-2xl">
            <div className="flex items-center gap-3 bg-destructive/10 p-5 text-destructive border-b border-destructive/20">
              <AlertTriangle className="size-6" />
              <h3 className="text-lg font-bold">Confirmar Eliminación</h3>
            </div>
            <div className="p-5 flex flex-col gap-3">
              <p className="text-sm text-foreground">
                ¿Estás seguro de que deseas eliminar{" "}
                {deleteConfirm.type === "category" ? "la categoría" : "el servicio"}{" "}
                <strong className="text-foreground">{deleteConfirm.name}</strong>?
              </p>
              {deleteConfirm.type === "category" && (
                <p className="text-xs font-semibold text-amber-600">
                  ¡Atención! Todos los servicios asociados a esta categoría también serán eliminados.
                </p>
              )}
              <div className="mt-4 flex items-center justify-end gap-3">
                <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (deleteConfirm.type === "category") {
                      onDeleteCategory(deleteConfirm.id)
                    } else if (deleteConfirm.categoryId) {
                      onDeleteService(deleteConfirm.categoryId, deleteConfirm.id)
                    }
                    setDeleteConfirm(null)
                  }}
                >
                  Eliminar Definitivamente
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RESET CONFIRMATION MODAL */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-panel-line bg-card shadow-2xl">
            <div className="flex items-center gap-3 bg-amber-500/10 p-5 text-amber-600 border-b border-amber-500/20">
              <AlertTriangle className="size-6" />
              <h3 className="text-lg font-bold">Restablecer Catálogo</h3>
            </div>
            <div className="p-5 flex flex-col gap-3">
              <p className="text-sm text-foreground">
                Esta acción restaurará todas las categorías, servicios y precios originales predeterminados del
                cotizador Tijerales. Se perderán las modificaciones no respaldadas.
              </p>
              <div className="mt-4 flex items-center justify-end gap-3">
                <Button variant="ghost" onClick={() => setIsResetConfirmOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
                  onClick={() => {
                    onResetToDefaults()
                    setIsResetConfirmOpen(false)
                  }}
                >
                  Restablecer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// -------------------------------------------------------------
// SERVICE MODAL (ADD / EDIT)
// -------------------------------------------------------------
function ServiceModal({
  categories,
  initialData,
  onClose,
  onSave,
}: {
  categories: Category[]
  initialData: { service: ServiceItem; categoryId: string } | null
  onClose: () => void
  onSave: (data: {
    name: string
    description: string
    price: number
    categoryId: string
    active: boolean
  }) => void
}) {
  const [name, setName] = useState(initialData?.service.name || "")
  const [description, setDescription] = useState(initialData?.service.description || "")
  const [price, setPrice] = useState<number | string>(initialData?.service.price || "")
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || categories[0]?.id || "")
  const [active, setActive] = useState(initialData?.service.active !== false)
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError("El nombre del servicio es obligatorio.")
      return
    }
    const numPrice = Number(price)
    if (isNaN(numPrice) || numPrice < 0) {
      setError("El precio unitario debe ser un número válido mayor o igual a 0.")
      return
    }
    if (!categoryId) {
      setError("Debes seleccionar una categoría.")
      return
    }

    onSave({
      name: name.trim(),
      description: description.trim(),
      price: numPrice,
      categoryId,
      active,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-panel-line bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-panel-line bg-brand-navy px-6 py-4 text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-quote-green" />
            <h3 className="text-lg font-bold">
              {initialData ? "Editar Servicio" : "Nuevo Servicio"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {/* Categoría */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">Categoría *</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground focus-visible:border-brand-accent focus-visible:outline-none"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Nombre */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">Nombre del Servicio *</label>
            <Input
              placeholder="Ej: BANDA DE CUMBIA EN VIVO"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (error) setError("")
              }}
            />
          </div>

          {/* Descripción */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">Descripción breve</label>
            <Textarea
              placeholder="Ej: Servicio de 3 horas con amplificación e iluminación"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Precio */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">Precio Unitario ($ CLP) *</label>
            <Input
              type="number"
              min={0}
              placeholder="Ej: 150000"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value)
                if (error) setError("")
              }}
            />
          </div>

          {/* Estado Activo */}
          <div className="flex items-center justify-between rounded-lg border border-panel-line bg-muted/30 p-3">
            <div>
              <span className="text-sm font-bold text-foreground">¿Servicio Activo?</span>
              <p className="text-xs text-muted-foreground">
                Si se desmarca, no aparecerá en el cotizador del cliente.
              </p>
            </div>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>

          {error && <p className="text-xs font-semibold text-destructive">{error}</p>}

          <div className="mt-2 flex items-center justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-quote-green hover:bg-quote-green-dark text-white font-bold px-5">
              {initialData ? "Guardar Cambios" : "Crear Servicio"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// CATEGORY MODAL (ADD / EDIT)
// -------------------------------------------------------------
function CategoryModal({
  initialData,
  onClose,
  onSave,
}: {
  initialData: Category | null
  onClose: () => void
  onSave: (data: { label: string; tabLabel?: string; color: string; iconName: string }) => void
}) {
  const [label, setLabel] = useState(initialData?.label || "")
  const [tabLabel, setTabLabel] = useState(initialData?.tabLabel || "")
  const [color, setColor] = useState(initialData?.color || COLOR_PRESETS[0].class)
  const [iconName, setIconName] = useState(initialData?.iconName || "Utensils")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!label.trim()) {
      setError("El nombre de la categoría es obligatorio.")
      return
    }

    onSave({
      label: label.trim(),
      tabLabel: (tabLabel || label).trim(),
      color,
      iconName,
    })
  }

  const iconKeys = Object.keys(ICON_MAP)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-panel-line bg-card shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-panel-line bg-brand-navy px-6 py-4 text-white">
          <div className="flex items-center gap-2">
            <FolderPlus className="size-5 text-quote-green" />
            <h3 className="text-lg font-bold">
              {initialData ? "Editar Categoría" : "Nueva Categoría"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto">
          {/* Nombre */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">Nombre de la Categoría *</label>
            <Input
              placeholder="Ej: VAJILLA Y MENAJE"
              value={label}
              onChange={(e) => {
                setLabel(e.target.value)
                if (!tabLabel || tabLabel === label) {
                  setTabLabel(e.target.value)
                }
                if (error) setError("")
              }}
            />
          </div>

          {/* Etiqueta Pestaña */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">Etiqueta corta en pestaña</label>
            <Input
              placeholder="Ej: VAJILLA"
              value={tabLabel}
              onChange={(e) => setTabLabel(e.target.value)}
            />
          </div>

          {/* Color Preset */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-foreground">Color de la Categoría</label>
            <div className="grid grid-cols-5 gap-2">
              {COLOR_PRESETS.map((preset) => {
                const isSelected = color === preset.class
                return (
                  <button
                    key={preset.class}
                    type="button"
                    onClick={() => setColor(preset.class)}
                    className={cn(
                      "flex items-center justify-center rounded-lg p-2 text-xs font-bold text-white transition-all",
                      preset.class,
                      isSelected ? "ring-3 ring-brand-navy ring-offset-2 scale-105" : "opacity-85 hover:opacity-100",
                    )}
                  >
                    {preset.label.split(" ")[0]}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Icon Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-foreground">Ícono Representativo</label>
            <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1 border border-panel-line rounded-lg bg-background">
              {iconKeys.map((key) => {
                const IconComp = ICON_MAP[key]
                const isSelected = iconName === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setIconName(key)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 rounded-md p-2 transition-all",
                      isSelected
                        ? "bg-brand-navy text-white shadow-xs"
                        : "text-foreground hover:bg-muted",
                    )}
                  >
                    <IconComp className="size-5" />
                    <span className="text-[9px] truncate max-w-full">{key}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {error && <p className="text-xs font-semibold text-destructive">{error}</p>}

          <div className="mt-2 flex items-center justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-quote-green hover:bg-quote-green-dark text-white font-bold px-5">
              {initialData ? "Guardar Cambios" : "Crear Categoría"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
