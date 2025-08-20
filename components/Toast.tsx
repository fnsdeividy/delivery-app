'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { X, CheckCircle, WarningCircle, Info, XCircle } from '@phosphor-icons/react'

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearToasts: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration || 5000
    }

    setToasts(prev => [...prev, newToast])

    // Auto-remove toast after duration
    if (newToast.duration !== Infinity) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const clearToasts = () => {
    setToasts([])
  }

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50 text-green-800'
      case 'error':
        return 'border-red-200 bg-red-50 text-red-800'
      case 'info':
        return 'border-blue-200 bg-blue-50 text-blue-800'
      default:
        return 'border-blue-200 bg-blue-50 text-blue-800'
    }
  }

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start p-4 rounded-lg border shadow-lg transition-all duration-300 ease-in-out ${getToastStyles(toast.type)}`}
          >
            <div className="flex-shrink-0 mr-3 mt-0.5">
              {getToastIcon(toast.type)}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium">{toast.title}</h4>
              {toast.message && (
                <p className="mt-1 text-sm opacity-90">{toast.message}</p>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
} 