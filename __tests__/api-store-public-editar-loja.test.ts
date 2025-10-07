import { DELETE, GET, PATCH, POST, PUT } from '@/app/api/store-public/editar-loja/route'
import { NextRequest } from 'next/server'

// Mock do fetch global
global.fetch = jest.fn()

describe('API Store Public - Editar Loja (Proxy)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const createMockRequest = (method: string, body?: string, headers?: Record<string, string>) => {
    const url = 'http://localhost:3000/api/store-public/editar-loja?test=123'
    const mockRequest = {
      url,
      method,
      headers: new Map(Object.entries(headers || {})),
      text: jest.fn().mockResolvedValue(body || ''),
    } as unknown as NextRequest

    return mockRequest
  }

  const createMockResponse = (status: number, body: string, headers?: Record<string, string>) => {
    const mockResponse = {
      status,
      statusText: 'OK',
      text: jest.fn().mockResolvedValue(body),
      headers: new Map(Object.entries(headers || {})),
    } as unknown as Response

    return mockResponse
  }

  describe('GET', () => {
    it('deve fazer proxy para GET request', async () => {
      const mockRequest = createMockRequest('GET')
      const mockResponse = createMockResponse(200, '{"success": true}')
      
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await GET(mockRequest)

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/stores/editar-loja?test=123',
        expect.objectContaining({
          method: 'GET',
          headers: expect.any(Object),
        })
      )
      expect(result.status).toBe(200)
    })
  })

  describe('POST', () => {
    it('deve fazer proxy para POST request com body', async () => {
      const body = '{"name": "Loja Teste"}'
      const mockRequest = createMockRequest('POST', body)
      const mockResponse = createMockResponse(201, '{"id": "123"}')
      
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await POST(mockRequest)

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/stores/editar-loja?test=123',
        expect.objectContaining({
          method: 'POST',
          body: body,
          headers: expect.any(Object),
        })
      )
      expect(result.status).toBe(201)
    })
  })

  describe('PUT', () => {
    it('deve fazer proxy para PUT request', async () => {
      const body = '{"name": "Loja Atualizada"}'
      const mockRequest = createMockRequest('PUT', body)
      const mockResponse = createMockResponse(200, '{"updated": true}')
      
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await PUT(mockRequest)

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/stores/editar-loja?test=123',
        expect.objectContaining({
          method: 'PUT',
          body: body,
        })
      )
      expect(result.status).toBe(200)
    })
  })

  describe('PATCH', () => {
    it('deve fazer proxy para PATCH request', async () => {
      const body = '{"name": "Loja Patch"}'
      const mockRequest = createMockRequest('PATCH', body)
      const mockResponse = createMockResponse(200, '{"patched": true}')
      
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await PATCH(mockRequest)

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/stores/editar-loja?test=123',
        expect.objectContaining({
          method: 'PATCH',
          body: body,
        })
      )
      expect(result.status).toBe(200)
    })
  })

  describe('DELETE', () => {
    it('deve fazer proxy para DELETE request', async () => {
      const mockRequest = createMockRequest('DELETE')
      const mockResponse = createMockResponse(204, '')
      
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await DELETE(mockRequest)

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/stores/editar-loja?test=123',
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.any(Object),
        })
      )
      expect(result.status).toBe(204)
    })
  })

  describe('Headers', () => {
    it('deve copiar headers relevantes da requisição original', async () => {
      const headers = {
        'authorization': 'Bearer token123',
        'content-type': 'application/json',
        'user-agent': 'test-agent',
      }
      const mockRequest = createMockRequest('GET', undefined, headers)
      const mockResponse = createMockResponse(200, '{"success": true}')
      
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      await GET(mockRequest)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'authorization': 'Bearer token123',
            'content-type': 'application/json',
            'user-agent': 'test-agent',
          }),
        })
      )
    })

    it('não deve copiar header host', async () => {
      const headers = {
        'host': 'localhost:3000',
        'authorization': 'Bearer token123',
      }
      const mockRequest = createMockRequest('GET', undefined, headers)
      const mockResponse = createMockResponse(200, '{"success": true}')
      
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      await GET(mockRequest)

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0]
      const requestConfig = fetchCall[1]
      
      expect(requestConfig.headers).not.toHaveProperty('host')
      expect(requestConfig.headers).toHaveProperty('authorization')
    })
  })

  describe('Query Parameters', () => {
    it('deve preservar query parameters na URL de destino', async () => {
      const mockRequest = createMockRequest('GET')
      const mockResponse = createMockResponse(200, '{"success": true}')
      
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      await GET(mockRequest)

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/stores/editar-loja?test=123',
        expect.any(Object)
      )
    })
  })

  describe('Error Handling', () => {
    it('deve retornar erro 500 quando fetch retorna erro', async () => {
      const mockRequest = createMockRequest('GET')
      
      ;(global.fetch as jest.Mock).mockResolvedValue({
        status: 500,
        statusText: 'Internal Server Error',
        text: jest.fn().mockResolvedValue('{"error": "Backend error"}'),
        headers: new Map(),
      })

      const result = await GET(mockRequest)

      expect(result.status).toBe(500)
    })
  })

  describe('Response Headers', () => {
    it('deve copiar headers da resposta do backend', async () => {
      const mockRequest = createMockRequest('GET')
      const mockResponse = createMockResponse(200, '{"success": true}', {
        'content-type': 'application/json',
        'cache-control': 'no-cache',
      })
      
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await GET(mockRequest)

      expect(result.headers.get('content-type')).toBe('application/json')
      expect(result.headers.get('cache-control')).toBe('no-cache')
    })

    it('não deve copiar header transfer-encoding', async () => {
      const mockRequest = createMockRequest('GET')
      const mockResponse = createMockResponse(200, '{"success": true}', {
        'transfer-encoding': 'chunked',
        'content-type': 'application/json',
      })
      
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await GET(mockRequest)

      expect(result.headers.get('transfer-encoding')).toBeUndefined()
      expect(result.headers.get('content-type')).toBe('application/json')
    })
  })
}) 