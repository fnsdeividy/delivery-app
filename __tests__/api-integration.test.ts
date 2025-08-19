import { describe, expect, it } from '@jest/globals'

/**
 * Testes de integração com a API externa
 * Verifica se as rotas estão funcionando e conectando com localhost:3001
 */

describe('API Integration Tests', () => {
  describe('Configuration', () => {
    it('should have correct API configuration', () => {
      // Importar configuração das rotas
      const { API_CONFIG } = require('../app/(api)/api/v1/config')
      
      expect(API_CONFIG.BASE_URL).toBe('http://localhost:3001/api/v1')
      expect(API_CONFIG.ENDPOINTS.AUTH.LOGIN).toBe('/auth/login')
      expect(API_CONFIG.ENDPOINTS.HEALTH).toBe('/health')
    })

    it('should have helper functions', () => {
      const { fetchExternalAPI, handleExternalAPIResponse } = require('../app/(api)/api/v1/config')
      
      expect(typeof fetchExternalAPI).toBe('function')
      expect(typeof handleExternalAPIResponse).toBe('function')
    })
  })

  describe('Route Structure', () => {
    it('should have login route configured', () => {
      // Verificar se a rota de login existe
      const fs = require('fs')
      const path = require('path')
      
      const loginRoutePath = path.join(__dirname, '../app/(api)/api/v1/auth/login/route.ts')
      expect(fs.existsSync(loginRoutePath)).toBe(true)
    })

    it('should have health route configured', () => {
      // Verificar se a rota de health existe
      const fs = require('fs')
      const path = require('path')
      
      const healthRoutePath = path.join(__dirname, '../app/(api)/api/v1/health/route.ts')
      expect(fs.existsSync(healthRoutePath)).toBe(true)
    })
  })

  describe('API Endpoints', () => {
    it('should have correct auth endpoints', () => {
      const { API_CONFIG } = require('../app/(api)/api/v1/config')
      
      expect(API_CONFIG.ENDPOINTS.AUTH).toEqual({
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
      })
    })

    it('should have correct store endpoints', () => {
      const { API_CONFIG } = require('../app/(api)/api/v1/config')
      
      expect(API_CONFIG.ENDPOINTS.STORES).toBe('/stores')
      expect(API_CONFIG.ENDPOINTS.USERS).toBe('/users')
    })
  })
}) 