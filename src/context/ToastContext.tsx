import React, { createContext, useContext, useState, useCallback } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  title: string
  message: string
  type: ToastType
}

interface ToastContextType {
  toasts: Toast[]
  showToast: (title: string, message: string, type?: ToastType) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const showToast = useCallback((title: string, message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { id, title, message, type }])
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      removeToast(id)
    }, 4000)
  }, [removeToast])

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      {/* Toast Render Portal */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full">
        {toasts.map(toast => {
          let borderClass = 'border-purple-500/30'
          let textClass = 'text-purple-400'
          let bgClass = 'bg-slate-900/80'

          if (toast.type === 'success') {
            borderClass = 'border-emerald-500/30'
            textClass = 'text-emerald-400'
          } else if (toast.type === 'error') {
            borderClass = 'border-rose-500/30'
            textClass = 'text-rose-400'
          } else if (toast.type === 'warning') {
            borderClass = 'border-amber-500/30'
            textClass = 'text-amber-400'
          }

          return (
            <div
              key={toast.id}
              className={`p-4 rounded-xl border glass-panel shadow-2xl flex flex-col transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-bottom-5`}
            >
              <div className="flex justify-between items-start">
                <span className={`font-semibold text-sm ${textClass}`}>{toast.title}</span>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-slate-400 hover:text-white text-xs transition-colors ml-4"
                >
                  &times;
                </button>
              </div>
              <p className="text-slate-300 text-xs mt-1 leading-relaxed">{toast.message}</p>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
