import { safeLocalStorage } from '@/lib/utils/environment'

describe('Safe LocalStorage', () => {
  let originalLocalStorage: Storage | undefined

  beforeEach(() => {
    // Salvar localStorage original
    originalLocalStorage = (global as any).window?.localStorage
  })

  afterEach(() => {
    // Restaurar localStorage original
    if ((global as any).window && originalLocalStorage) {
      ;(global as any).window.localStorage = originalLocalStorage
    }
  })

  describe('getItem', () => {
    it('deve retornar null quando localStorage não está disponível', () => {
      // Simular ambiente sem localStorage
      delete (global as any).window.localStorage

      const result = safeLocalStorage.getItem('test-key')
      expect(result).toBe(null)
    })
  })

  describe('setItem', () => {
    it('deve falhar silenciosamente quando localStorage não está disponível', () => {
      // Simular ambiente sem localStorage
      delete (global as any).window.localStorage

      expect(() => {
        safeLocalStorage.setItem('test-key', 'test-value')
      }).not.toThrow()
    })
  })

  describe('removeItem', () => {
    it('deve falhar silenciosamente quando localStorage não está disponível', () => {
      // Simular ambiente sem localStorage
      delete (global as any).window.localStorage

      expect(() => {
        safeLocalStorage.removeItem('test-key')
      }).not.toThrow()
    })
  })
}) 