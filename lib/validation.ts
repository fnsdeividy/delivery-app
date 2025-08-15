export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => string | null
}

export interface ValidationSchema {
  [field: string]: ValidationRule
}

export interface ValidationResult {
  isValid: boolean
  errors: { [field: string]: string }
}

export class Validator {
  /**
   * Valida um objeto baseado em um schema de validação
   */
  static validate(data: any, schema: ValidationSchema): ValidationResult {
    const errors: { [field: string]: string } = {}
    let isValid = true

    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field]
      const error = this.validateField(value, rules, field)
      
      if (error) {
        errors[field] = error
        isValid = false
      }
    }

    return { isValid, errors }
  }

  /**
   * Valida um campo específico
   */
  private static validateField(value: any, rules: ValidationRule, fieldName: string): string | null {
    // Validação de campo obrigatório
    if (rules.required && (value === undefined || value === null || value === '')) {
      return `${this.getFieldLabel(fieldName)} é obrigatório`
    }

    // Se o campo não é obrigatório e está vazio, não validar mais
    if (!rules.required && (value === undefined || value === null || value === '')) {
      return null
    }

    // Validação de comprimento mínimo
    if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
      return `${this.getFieldLabel(fieldName)} deve ter pelo menos ${rules.minLength} caracteres`
    }

    // Validação de comprimento máximo
    if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
      return `${this.getFieldLabel(fieldName)} deve ter no máximo ${rules.maxLength} caracteres`
    }

    // Validação de padrão (regex)
    if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
      return `${this.getFieldLabel(fieldName)} tem formato inválido`
    }

    // Validação customizada
    if (rules.custom) {
      const customError = rules.custom(value)
      if (customError) {
        return customError
      }
    }

    return null
  }

  /**
   * Converte nome do campo para label legível
   */
  private static getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Nome',
      email: 'Email',
      password: 'Senha',
      phone: 'Telefone',
      address: 'Endereço',
      description: 'Descrição',
      price: 'Preço',
      category: 'Categoria',
      slug: 'Slug',
      title: 'Título',
      content: 'Conteúdo'
    }

    return labels[fieldName] || fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
  }
}

/**
 * Schemas de validação pré-definidos
 */
export const validationSchemas = {
  user: {
    name: { required: true, minLength: 2, maxLength: 100 },
    email: { 
      required: true, 
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      custom: (value: string) => {
        if (value && !value.includes('@')) {
          return 'Email deve conter @'
        }
        return null
      }
    },
    password: { required: true, minLength: 6 },
    phone: { 
      pattern: /^[\+]?[1-9][\d]{0,15}$/,
      custom: (value: string) => {
        if (value && !/^[\+]?[1-9][\d]{0,15}$/.test(value)) {
          return 'Telefone deve conter apenas números e pode começar com +'
        }
        return null
      }
    }
  },

  store: {
    name: { required: true, minLength: 2, maxLength: 100 },
    slug: { 
      required: true, 
      pattern: /^[a-z0-9-]+$/,
      custom: (value: string) => {
        if (value && !/^[a-z0-9-]+$/.test(value)) {
          return 'Slug deve conter apenas letras minúsculas, números e hífens'
        }
        return null
      }
    },
    description: { maxLength: 500 },
    'config.address': { required: true, minLength: 10 },
    'config.phone': { 
      required: true,
      pattern: /^[\+]?[1-9][\d]{0,15}$/
    },
    'config.email': { 
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    'config.category': { required: true, minLength: 2 },
    'config.deliveryFee': { 
      required: true,
      custom: (value: number) => {
        if (value < 0) {
          return 'Taxa de entrega não pode ser negativa'
        }
        return null
      }
    },
    'config.minimumOrder': { 
      required: true,
      custom: (value: number) => {
        if (value < 0) {
          return 'Pedido mínimo não pode ser negativo'
        }
        return null
      }
    }
  },

  product: {
    name: { required: true, minLength: 2, maxLength: 100 },
    description: { maxLength: 1000 },
    price: { 
      required: true,
      custom: (value: number) => {
        if (value <= 0) {
          return 'Preço deve ser maior que zero'
        }
        return null
      }
    },
    categoryId: { required: true },
    'originalPrice': {
      custom: (value: number) => {
        if (value && value <= 0) {
          return 'Preço original deve ser maior que zero'
        }
        return null
      }
    }
  },

  category: {
    name: { required: true, minLength: 2, maxLength: 100 },
    description: { maxLength: 500 }
  },

  order: {
    'customer.name': { required: true, minLength: 2 },
    'customer.phone': { 
      required: true,
      pattern: /^[\+]?[1-9][\d]{0,15}$/
    },
    'customer.address': { 
      required: true,
      minLength: 10
    },
    items: {
      required: true,
      custom: (value: any[]) => {
        if (!Array.isArray(value) || value.length === 0) {
          return 'Pedido deve conter pelo menos um item'
        }
        return null
      }
    }
  }
}

/**
 * Hook para validação de formulários
 */
export function useFormValidation<T>(schema: ValidationSchema) {
  const validate = (data: T): ValidationResult => {
    return Validator.validate(data, schema)
  }

  const validateField = (field: string, value: any): string | null => {
    const fieldSchema = schema[field]
    if (!fieldSchema) return null
    
    return Validator.validateField(value, fieldSchema, field)
  }

  return {
    validate,
    validateField,
    isValid: (data: T) => validate(data).isValid
  }
} 

// Validações para operações de lojas
export interface StoreApprovalValidation {
  storeId: string
  userId: string
  userRole: string
}

export interface StoreRejectionValidation extends StoreApprovalValidation {
  reason?: string
}

export function validateStoreApproval(data: StoreApprovalValidation): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.storeId || data.storeId.trim() === '') {
    errors.push('ID da loja é obrigatório')
  }

  if (!data.userId || data.userId.trim() === '') {
    errors.push('ID do usuário é obrigatório')
  }

  if (!data.userRole || data.userRole !== 'super_admin') {
    errors.push('Usuário deve ter permissão de super administrador')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateStoreRejection(data: StoreRejectionValidation): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.storeId || data.storeId.trim() === '') {
    errors.push('ID da loja é obrigatório')
  }

  if (!data.userId || data.userId.trim() === '') {
    errors.push('ID do usuário é obrigatório')
  }

  if (!data.userRole || data.userRole !== 'super_admin') {
    errors.push('Usuário deve ter permissão de super administrador')
  }

  // Motivo da rejeição é opcional, mas se fornecido deve ter pelo menos 3 caracteres
  if (data.reason && data.reason.trim().length < 3) {
    errors.push('Motivo da rejeição deve ter pelo menos 3 caracteres')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
} 