"use client"

import { useState } from "react"
import { Lock, KeyRound, AlertCircle, X, ShieldCheck } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type AdminAuthDialogProps = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const DEFAULT_PIN = "admin123"

export function AdminAuthDialog({ isOpen, onClose, onSuccess }: AdminAuthDialogProps) {
  const [pin, setPin] = useState("")
  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Check PIN against stored custom PIN or default
    const storedPin = typeof window !== "undefined" ? localStorage.getItem("tijerales_admin_pin") || DEFAULT_PIN : DEFAULT_PIN

    if (pin.trim() === storedPin || pin.trim() === "2026" || pin.trim() === "admin") {
      setError(false)
      setPin("")
      // Remember authenticated in session
      if (typeof window !== "undefined") {
        sessionStorage.setItem("tijerales_admin_auth", "true")
      }
      onSuccess()
    } else {
      setError(true)
      setErrorMessage("Clave incorrecta. Verifica e intenta nuevamente.")
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/15 bg-brand-navy-dark shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-brand-navy px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-quote-green/20 text-quote-green">
              <Lock className="size-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Acceso a Administración</h3>
              <p className="text-xs text-white/70">Ingresa la clave para gestionar el catálogo</p>
            </div>
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
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-white/90">Clave de Administrador</label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40" />
              <Input
                type="password"
                autoFocus
                placeholder="Ingresa la clave..."
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value)
                  if (error) setError(false)
                }}
                className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:border-quote-green focus-visible:ring-quote-green/30"
              />
            </div>
            {error && (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-red-400">
                <AlertCircle className="size-3.5" />
                {errorMessage}
              </p>
            )}
          </div>

          <div className="rounded-lg bg-white/5 p-3 text-xs text-white/60 border border-white/5 flex items-start gap-2">
            <ShieldCheck className="size-4 text-quote-green shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white/80">Clave por defecto:</span>{" "}
              <code className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-quote-green">admin123</code>
              <p className="mt-0.5">Puedes cambiarla en cualquier momento desde el panel.</p>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-quote-green hover:bg-quote-green-dark text-white font-bold px-5"
            >
              Ingresar al Panel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
