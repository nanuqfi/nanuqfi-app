'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { X, CheckCircle2, XCircle, Info } from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
  dismiss: (id: string) => void
}

// ─── Context ────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>')
  return ctx
}

// ─── Provider ───────────────────────────────────────────────────────────────

const AUTO_DISMISS_MS = 5_000

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const counterRef = useRef(0)

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `toast-${++counterRef.current}-${Date.now()}`
    setToasts(prev => [...prev, { id, message, type }])
  }, [])

  return (
    <ToastContext value={{ toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext>
  )
}

// ─── Container ──────────────────────────────────────────────────────────────

function ToastContainer({
  toasts,
  dismiss,
}: {
  toasts: Toast[]
  dismiss: (id: string) => void
}) {
  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none"
    >
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} dismiss={dismiss} />
      ))}
    </div>
  )
}

// ─── Item ───────────────────────────────────────────────────────────────────

const ICON_MAP: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
}

const STYLE_MAP: Record<ToastType, string> = {
  success: 'border-emerald-500/40 text-emerald-300',
  error: 'border-red-500/40 text-red-300',
  info: 'border-sky-500/40 text-sky-300',
}

function ToastItem({
  toast: t,
  dismiss,
}: {
  toast: Toast
  dismiss: (id: string) => void
}) {
  const [exiting, setExiting] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    timerRef.current = setTimeout(() => setExiting(true), AUTO_DISMISS_MS)
    return () => clearTimeout(timerRef.current)
  }, [])

  // After exit animation completes, remove from state
  function handleAnimationEnd() {
    if (exiting) dismiss(t.id)
  }

  const Icon = ICON_MAP[t.type]

  return (
    <div
      role="status"
      onAnimationEnd={handleAnimationEnd}
      className={[
        'pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl bg-[#0a0c10]/90 shadow-lg max-w-sm',
        STYLE_MAP[t.type],
        exiting ? 'animate-toast-out' : 'animate-toast-in',
      ].join(' ')}
    >
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      <p className="text-sm text-slate-200 leading-snug flex-1">{t.message}</p>
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={() => setExiting(true)}
        className="shrink-0 text-slate-500 hover:text-slate-300 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
