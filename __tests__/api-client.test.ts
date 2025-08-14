import { apiClient } from '@/lib/api-client'

// Mock do localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue('test-token')
  })

  it('should be defined', () => {
    expect(apiClient).toBeDefined()
  })

  it('should have required methods', () => {
    expect(typeof apiClient.get).toBe('function')
    expect(typeof apiClient.post).toBe('function')
    expect(typeof apiClient.patch).toBe('function')
    expect(typeof apiClient.delete).toBe('function')
    expect(typeof apiClient.authenticate).toBe('function')
    expect(typeof apiClient.logout).toBe('function')
    expect(typeof apiClient.isAuthenticated).toBe('function')
    expect(typeof apiClient.getCurrentToken).toBe('function')
  })

  it('should check authentication status', () => {
    const isAuth = apiClient.isAuthenticated()
    expect(isAuth).toBe(true)
    expect(localStorageMock.getItem).toHaveBeenCalledWith('cardapio_token')
  })

  it('should get current token', () => {
    const token = apiClient.getCurrentToken()
    expect(token).toBe('test-token')
    expect(localStorageMock.getItem).toHaveBeenCalledWith('cardapio_token')
  })

  it('should clear token on logout', () => {
    apiClient.logout()
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('cardapio_token')
  })
}) 