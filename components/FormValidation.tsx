'use client'

import { useState, useEffect } from 'react'
import { WarningCircle } from '@phosphor-icons/react'

interface ValidationError {
  field: string
  message: string
}

interface FormValidationProps {
  errors: ValidationError[]
  onClearErrors?: () => void
}

export function FormValidation({ errors, onClearErrors }: FormValidationProps) {
  const [visibleErrors, setVisibleErrors] = useState<ValidationError[]>([])

  useEffect(() => {
    if (errors.length > 0) {
      setVisibleErrors(errors)

      // Auto-clear errors after 5 seconds
      const timer = setTimeout(() => {
        setVisibleErrors([])
        onClearErrors?.()
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [errors, onClearErrors])

  if (visibleErrors.length === 0) return null

  return (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start">
        <WarningCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-red-800 mb-2">
            Por favor, corrija os seguintes erros:
          </h4>
          <ul className="space-y-1">
            {visibleErrors.map((error, index) => (
              <li key={index} className="text-sm text-red-700 flex items-center">
                <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                <strong className="capitalize">{error.field}:</strong> {error.message}
              </li>
            ))}
          </ul>
        </div>
        <button
          onClick={() => {
            setVisibleErrors([])
            onClearErrors?.()
          }}
          className="text-red-400 hover:text-red-600 transition-colors ml-3"
        >
          ×
        </button>
      </div>
    </div>
  )
}

// Hook para validação de formulários
export function useFormValidation() {
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validateField = (field: string, value: any, rules: ValidationRule[]) => {
    const fieldErrors: ValidationError[] = []

    rules.forEach(rule => {
      if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        fieldErrors.push({
          field,
          message: `${rule.fieldName || field} é obrigatório`
        })
      } else if (rule.minLength && value && value.length < rule.minLength) {
        fieldErrors.push({
          field,
          message: `${rule.fieldName || field} deve ter pelo menos ${rule.minLength} caracteres`
        })
      } else if (rule.maxLength && value && value.length > rule.maxLength) {
        fieldErrors.push({
          field,
          message: `${rule.fieldName || field} deve ter no máximo ${rule.maxLength} caracteres`
        })
      } else if (rule.pattern && value && !rule.pattern.test(value)) {
        fieldErrors.push({
          field,
          message: rule.message || `${rule.fieldName || field} tem formato inválido`
        })
      }
    })

    return fieldErrors
  }

  const validateForm = (data: Record<string, any>, validationRules: Record<string, ValidationRule[]>) => {
    const allErrors: ValidationError[] = []

    Object.keys(validationRules).forEach(field => {
      const fieldErrors = validateField(field, data[field], validationRules[field])
      allErrors.push(...fieldErrors)
    })

    setErrors(allErrors)
    return allErrors.length === 0
  }

  const markFieldAsTouched = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  const clearErrors = () => {
    setErrors([])
    setTouched({})
  }

  const getFieldError = (field: string) => {
    return errors.find(error => error.field === field)
  }

  const isFieldTouched = (field: string) => {
    return touched[field] || false
  }

  return {
    errors,
    touched,
    validateForm,
    markFieldAsTouched,
    clearErrors,
    getFieldError,
    isFieldTouched
  }
}

interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  message?: string
  fieldName?: string
}
