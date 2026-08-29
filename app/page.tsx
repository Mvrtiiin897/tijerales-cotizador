"use client"

import { useMemo, useRef, useState, useEffect } from "react"
import { Settings, Info, Minus, Square, X, ShieldAlert } from "lucide-react"
import { useCatalog } from "@/hooks/use-catalog"
import { downloadQuoteXlsx } from "@/lib/export-quote-xlsx"
import { CategoryTabs } from "@/components/category-tabs"
import { ClientPanel } from "@/components/client-panel"
import { ServiceTable } from "@/components/service-table"
import { SummaryPanel } from "@/components/summary-panel"
import { AdminPanel } from "@/components/admin/admin-panel"
import { AdminAuthDialog } from "@/components/admin/admin-auth-dialog"

const IVA_RATE = 0.19

export default function Page() {
  const {
    categories,
    activeCategories,
    stats,
    addCategory,
    updateCategory,
    deleteCategory,
    addService,
    updateService,
    deleteService,
    toggleServiceActive,
    resetToDefaults,
    persistCategories,
  } = useCatalog()

  const [isAdminOpen, setIsAdminOpen] = useState(false)
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false)

  const [activeTab, setActiveTab] = useState("menus")
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  const [company, setCompany] = useState("")
  const [date, setDate] = useState("2026-06-26")
  const [ocData, setOcData] = useState("")
  const [discount, setDiscount] = useState("0")
  const [isPercent, setIsPercent] = useState(false)
  const [observations, setObservations] = useState("")

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const productCategories = useMemo(
    () => activeCategories.filter((c) => c.id !== "resumen"),
    [activeCategories],
  )

  // Ensure active tab points to a valid category
  useEffect(() => {
    if (activeCategories.length > 0 && !activeCategories.some((c) => c.id === activeTab)) {
      setActiveTab(activeCategories[0].id)
    }
  }, [activeCategories, activeTab])

  const handleQuantity = (itemId: string, quantity: number) => {
    setQuantities((prev) => ({ ...prev, [itemId]: quantity }))
  }

  const handleTab = (id: string) => {
    setActiveTab(id)
    const el = sectionRefs.current[id]
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const { net, iva, discountValue, finalTotal } = useMemo(() => {
    const net = productCategories.reduce((sum, cat) => {
      return sum + cat.items.reduce((s, item) => s + (quantities[item.id] ?? 0) * item.price, 0)
    }, 0)
    const iva = net * IVA_RATE
    const gross = net + iva
    const rawDiscount = Number.parseFloat(discount)
    const discNum = Number.isNaN(rawDiscount) ? 0 : Math.max(0, rawDiscount)
    const rawValue = isPercent ? net * (discNum / 100) : discNum
    const discountValue = Math.min(Math.max(0, rawValue), gross)
    const finalTotal = gross - discountValue
    return { net, iva, discountValue, finalTotal }
  }, [quantities, discount, isPercent, productCategories])

  const handleClear = () => {
    setQuantities({})
    setCompany("")
    setOcData("")
    setDiscount("0")
    setIsPercent(false)
    setObservations("")
  }

  const handleGenerate = () => {
    downloadQuoteXlsx({
      categories: activeCategories,
      company,
      date,
      ocData,
      discount,
      isPercent,
      observations,
      quantities,
      net,
      iva,
      discountValue,
      finalTotal,
    })
    setActiveTab("resumen")
  }

  const handleAdminClick = () => {
    // Check if session is already authenticated
    const isAuth = typeof window !== "undefined" && sessionStorage.getItem("tijerales_admin_auth") === "true"
    if (isAuth) {
      setIsAdminOpen(true)
    } else {
      setIsAuthDialogOpen(true)
    }
  }

  return (
    <div className="min-h-screen bg-app-canvas p-3 md:p-5">
      <div className="mx-auto flex max-w-[1500px] flex-col overflow-hidden rounded-2xl border border-brand-navy-dark bg-card shadow-2xl">
        {/* Title bar */}
        <div className="flex items-center justify-between bg-titlebar px-4 py-2 text-white">
          <div className="flex items-center gap-2 text-sm">
            <span className="flex size-4 items-center justify-center rounded-[3px] bg-cat-menus text-[10px] font-bold">
              T
            </span>
            <span className="font-medium text-white/90">
              Tijerales - {isAdminOpen ? "Panel de Administración" : "Cotizador 2026"}
            </span>
          </div>
          <div className="flex items-center gap-4 text-white/70">
            <Minus className="size-4" />
            <Square className="size-3.5" />
            <X className="size-4" />
          </div>
        </div>

        {/* Header */}
        <header className="flex items-center justify-between gap-4 bg-brand-navy px-6 py-5">
          <div className="flex items-center gap-3">
            <TijeralesLogo />
            <div className="leading-none">
              <p className="text-2xl font-extrabold tracking-[0.15em] text-white">TIJERALES</p>
              <p className="text-[10px] font-semibold tracking-[0.35em] text-white/70">ESTRUCTURAS &amp; EVENTOS</p>
            </div>
          </div>

          <h1 className="hidden flex-1 text-center text-2xl font-extrabold tracking-wide text-white text-balance lg:block xl:text-3xl">
            {isAdminOpen ? "ADMINISTRACIÓN DEL CATÁLOGO" : "DESGLOSE FORMAL – TIJERALES 2026"}
          </h1>

          <button
            type="button"
            onClick={isAdminOpen ? () => setIsAdminOpen(false) : handleAdminClick}
            className={`flex items-center gap-2 rounded-lg px-4 py-3 text-white shadow-sm ring-1 ring-white/15 transition-all ${
              isAdminOpen
                ? "bg-quote-green hover:bg-quote-green-dark"
                : "bg-brand-navy-dark hover:bg-brand-accent"
            }`}
          >
            <Settings className="size-5" />
            <span className="font-semibold">{isAdminOpen ? "Ver Cotizador" : "Administración"}</span>
          </button>
        </header>

        {/* Body View */}
        <div className="bg-app-canvas p-5">
          {isAdminOpen ? (
            <AdminPanel
              categories={categories}
              stats={stats}
              onBack={() => setIsAdminOpen(false)}
              onAddCategory={addCategory}
              onUpdateCategory={updateCategory}
              onDeleteCategory={deleteCategory}
              onAddService={addService}
              onUpdateService={updateService}
              onDeleteService={deleteService}
              onToggleServiceActive={toggleServiceActive}
              onResetToDefaults={resetToDefaults}
              onPersistCategories={persistCategories}
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)_320px]">
              {/* Left column */}
              <ClientPanel
                company={company}
                setCompany={setCompany}
                date={date}
                setDate={setDate}
                ocData={ocData}
                setOcData={setOcData}
                discount={discount}
                setDiscount={setDiscount}
                isPercent={isPercent}
                setIsPercent={setIsPercent}
                observations={observations}
                setObservations={setObservations}
              />

              {/* Center column */}
              <div className="flex flex-col gap-5">
                <CategoryTabs
                  categories={activeCategories}
                  active={activeTab}
                  onSelect={handleTab}
                />

                <div className="flex flex-col gap-5">
                  {productCategories.map((cat) => (
                    <div
                      key={cat.id}
                      ref={(el) => {
                        sectionRefs.current[cat.id] = el
                      }}
                      className="scroll-mt-4"
                    >
                      <ServiceTable category={cat} quantities={quantities} onChange={handleQuantity} />
                    </div>
                  ))}

                  <p className="flex items-center justify-center gap-2 pb-1 text-sm text-muted-foreground">
                    <Info className="size-4" />
                    Para modificar cantidades, use los botones + y − o escriba el número.
                  </p>
                </div>
              </div>

              {/* Right column */}
              <div className="xl:col-start-3">
                <SummaryPanel
                  net={net}
                  iva={iva}
                  discountValue={discountValue}
                  finalTotal={finalTotal}
                  onClear={handleClear}
                  onGenerate={handleGenerate}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between bg-brand-navy px-6 py-3 text-sm text-white/80">
          <span>© 2026 Tijerales Estructuras &amp; Eventos</span>
          <span>Versión 2.0.0 (Catálogo Dinámico)</span>
        </footer>
      </div>

      {/* Admin Auth Modal */}
      <AdminAuthDialog
        isOpen={isAuthDialogOpen}
        onClose={() => setIsAuthDialogOpen(false)}
        onSuccess={() => {
          setIsAuthDialogOpen(false)
          setIsAdminOpen(true)
        }}
      />
    </div>
  )
}

function TijeralesLogo() {
  return (
    <svg
      width="56"
      height="44"
      viewBox="0 0 56 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="text-white"
    >
      <path d="M4 40 L28 8 L52 40" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M4 40 L28 24 L52 40" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M28 8 L28 24" stroke="currentColor" strokeWidth="2.5" />
      <path d="M14 40 L14 32 M42 40 L42 32" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  )
}

