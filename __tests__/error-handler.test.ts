import { ErrorHandler, useErrorHandler } from '@/lib/error-handler'
import { AxiosError } from 'axios'

// Mock do AxiosError
const createMockAxiosError = (status: number, data?: any, code?: string): AxiosError => {
  const error = new Error('Mock error') as AxiosError
  error.response = {
    status,
    data,
    statusText: 'Mock status text',
    headers: {},
    config: {} as any
  }
  error.code = code
  return error
}

describe('ErrorHandler', () => {
  describe('handleApiError', () => {
    it('deve processar erro de validação (400)', () => {
      const mockData = {
        message: 'Validation failed',
        errors: [
          { field: 'email', message: 'Email inválido' },
          { field: 'name', message: 'Nome é obrigatório' }
        ],
        statusCode: 400
      }
      
      const error = createMockAxiosError(400, mockData)
      const result = ErrorHandler.handleApiError(error)
      
      expect(result.code).toBe('VALIDATION_ERROR')
      expect(result.status).toBe(400)
      expect(result.message).toContain('Erro de validação')
      expect(result.details).toEqual(mockData.errors)
    })

    it('deve processar erro de autenticação (401)', () => {
      const error = createMockAxiosError(401)
      const result = ErrorHandler.handleApiError(error)
      
      expect(result.code).toBe('UNAUTHORIZED')
      expect(result.status).toBe(401)
      expect(result.message).toBe('Sessão expirada. Faça login novamente.')
    })

    it('deve processar erro de autorização (403)', () => {
      const error = createMockAxiosError(403)
      const result = ErrorHandler.handleApiError(error)
      
      expect(result.code).toBe('FORBIDDEN')
      expect(result.status).toBe(403)
      expect(result.message).toBe('Você não tem permissão para realizar esta ação.')
    })

    it('deve processar erro não encontrado (404)', () => {
      const error = createMockAxiosError(404)
      const result = ErrorHandler.handleApiError(error)
      
      expect(result.code).toBe('NOT_FOUND')
      expect(result.status).toBe(404)
      expect(result.message).toBe('Recurso não encontrado.')
    })

    it('deve processar erro de conflito (409)', () => {
      const mockData = { message: 'Email já existe' }
      const error = createMockAxiosError(409, mockData)
      const result = ErrorHandler.handleApiError(error)
      
      expect(result.code).toBe('CONFLICT')
      expect(result.status).toBe(409)
      expect(result.message).toBe('Email já existe')
    })

    it('deve processar erro do servidor (500)', () => {
      const error = createMockAxiosError(500)
      const result = ErrorHandler.handleApiError(error)
      
      expect(result.code).toBe('SERVER_ERROR')
      expect(result.status).toBe(500)
      expect(result.message).toBe('Erro interno do servidor. Tente novamente mais tarde.')
    })

    it('deve processar erro de rede', () => {
      const error = createMockAxiosError(0, null, 'NETWORK_ERROR')
      const result = ErrorHandler.handleApiError(error)
      
      expect(result.code).toBe('NETWORK_ERROR')
      expect(result.message).toBe('Erro de conexão. Verifique sua internet e tente novamente.')
    })

    it('deve processar erro genérico da API', () => {
      const mockData = { message: 'Erro customizado da API' }
      const error = createMockAxiosError(422, mockData)
      const result = ErrorHandler.handleApiError(error)
      
      expect(result.code).toBe('API_ERROR')
      expect(result.message).toBe('Erro customizado da API')
    })

    it('deve processar erro de Error padrão', () => {
      const error = new Error('Erro padrão')
      const result = ErrorHandler.handleApiError(error)
      
      expect(result.code).toBe('UNKNOWN_ERROR')
      expect(result.message).toBe('Erro padrão')
    })

    it('deve processar erro desconhecido', () => {
      const error = 'String error'
      const result = ErrorHandler.handleApiError(error)
      
      expect(result.code).toBe('UNKNOWN_ERROR')
      expect(result.message).toBe('Ocorreu um erro inesperado')
    })
  })

  describe('métodos de verificação', () => {
    it('deve identificar erro de validação', () => {
      const error = { code: 'VALIDATION_ERROR' }
      expect(ErrorHandler.isValidationError(error)).toBe(true)
      expect(ErrorHandler.isValidationError({ code: 'OTHER' })).toBe(false)
    })

    it('deve identificar erro de autenticação', () => {
      expect(ErrorHandler.isAuthError({ code: 'UNAUTHORIZED' })).toBe(true)
      expect(ErrorHandler.isAuthError({ code: 'FORBIDDEN' })).toBe(true)
      expect(ErrorHandler.isAuthError({ code: 'OTHER' })).toBe(false)
    })

    it('deve identificar erro de rede', () => {
      expect(ErrorHandler.isNetworkError({ code: 'NETWORK_ERROR' })).toBe(true)
      expect(ErrorHandler.isNetworkError({ code: 'OTHER' })).toBe(false)
    })

    it('deve identificar erro do servidor', () => {
      expect(ErrorHandler.isServerError({ code: 'SERVER_ERROR' })).toBe(true)
      expect(ErrorHandler.isServerError({ code: 'OTHER' })).toBe(false)
    })
  })

  describe('getValidationMessages', () => {
    it('deve retornar mensagens de validação formatadas', () => {
      const error = {
        code: 'VALIDATION_ERROR',
        details: [
          { field: 'email', message: 'Email inválido' },
          { field: 'name', message: 'Nome é obrigatório' }
        ]
      }
      
      const messages = ErrorHandler.getValidationMessages(error)
      expect(messages).toEqual([
        'email: Email inválido',
        'name: Nome é obrigatório'
      ])
    })

    it('deve retornar array vazio para erro sem detalhes', () => {
      const error = { code: 'VALIDATION_ERROR' }
      const messages = ErrorHandler.getValidationMessages(error)
      expect(messages).toEqual([])
    })

    it('deve retornar array vazio para erro que não é de validação', () => {
      const error = { code: 'OTHER' }
      const messages = ErrorHandler.getValidationMessages(error)
      expect(messages).toEqual([])
    })
  })

  describe('logError', () => {
    let consoleSpy: jest.SpyInstance

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'group').mockImplementation()
      jest.spyOn(console, 'error').mockImplementation()
      jest.spyOn(console, 'log').mockImplementation()
      jest.spyOn(console, 'groupEnd').mockImplementation()
    })

    afterEach(() => {
      consoleSpy.mockRestore()
      jest.restoreAllMocks()
    })

    it('deve logar erro em desenvolvimento', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      const error = new Error('Test error')
      ErrorHandler.logError(error, 'Test Context')
      
      expect(consoleSpy).toHaveBeenCalledWith('🚨 Error in Test Context')
      
      process.env.NODE_ENV = originalEnv
    })

    it('não deve logar erro em produção', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'
      
      const error = new Error('Test error')
      ErrorHandler.logError(error, 'Test Context')
      
      expect(consoleSpy).not.toHaveBeenCalled()
      
      process.env.NODE_ENV = originalEnv
    })
  })
})

describe('useErrorHandler', () => {
  it('deve retornar funções de tratamento de erro', () => {
    const errorHandler = useErrorHandler()
    
    expect(errorHandler.handleError).toBeDefined()
    expect(errorHandler.showErrorToast).toBeDefined()
    expect(errorHandler.handleAndShowError).toBeDefined()
    expect(errorHandler.isValidationError).toBeDefined()
    expect(errorHandler.isAuthError).toBeDefined()
    expect(errorHandler.isNetworkError).toBeDefined()
    expect(errorHandler.isServerError).toBeDefined()
    expect(errorHandler.getValidationMessages).toBeDefined()
  })

  it('deve processar erro corretamente', () => {
    const errorHandler = useErrorHandler()
    const error = createMockAxiosError(400)
    
    const result = errorHandler.handleError(error, 'Test Context')
    
    expect(result.code).toBe('VALIDATION_ERROR')
    expect(result.status).toBe(400)
  })

  it('deve processar e mostrar erro', () => {
    const errorHandler = useErrorHandler()
    const error = createMockAxiosError(500)
    
    const result = errorHandler.handleAndShowError(error, 'Test Context')
    
    expect(result.code).toBe('SERVER_ERROR')
    expect(result.status).toBe(500)
  })
}) 