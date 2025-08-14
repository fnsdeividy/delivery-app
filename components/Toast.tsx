'use client'

import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { createContext, ReactNode, useCallback, useContext, useState } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  persistent?: boolean
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
    throw new Error('useToast deve ser usado dentro de um ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toast
    }

    setToasts(prev => [...prev, newToast])

    // Auto-remove se não for persistente
    if (!newToast.persistent && newToast.duration) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const clearToasts = useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

function ToastContainer() {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}

interface ToastItemProps {
  toast: Toast
  onRemove: (id: string) => void
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-400" />
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />
      case 'info':
        return <InformationCircleIcon className="w-5 h-5 text-blue-400" />
      default:
        return null
    }
  }

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'info':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return 'border-green-200'
      case 'error':
        return 'border-red-200'
      case 'warning':
        return 'border-yellow-200'
      case 'info':
        return 'border-blue-200'
      default:
        return 'border-gray-200'
    }
  }

  return (
    <div
      className={`${getBackgroundColor()} border ${getBorderColor()} rounded-lg p-4 shadow-lg transition-all duration-300 ease-in-out transform translate-x-0 opacity-100`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">
              {toast.title}
            </h4>
            <button
              onClick={() => onRemove(toast.id)}
              className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
          {toast.message && (
            <p className="mt-1 text-sm text-gray-600">
              {toast.message}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// Funções utilitárias para facilitar o uso
export const toast = {
  success: (title: string, message?: string) => {
    // Será implementado quando o contexto estiver disponível
    console.log('Success Toast:', title, message)
  },
  error: (title: string, message?: string) => {
    console.error('Error Toast:', title, message)
  },
  warning: (title: string, message?: string) => {
    console.warn('Warning Toast:', title, message)
  },
  info: (title: string, message?: string) => {
    console.info('Info Toast:', title, message)
  }
} 