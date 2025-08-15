import { validateStoreApproval, validateStoreRejection } from '../lib/validation'

describe('Store Approval Validation', () => {
  describe('validateStoreApproval', () => {
    it('should validate correct approval data', () => {
      const validData = {
        storeId: 'store123',
        userId: 'user456',
        userRole: 'super_admin'
      }

      const result = validateStoreApproval(validData)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject approval with missing storeId', () => {
      const invalidData = {
        storeId: '',
        userId: 'user456',
        userRole: 'super_admin'
      }

      const result = validateStoreApproval(invalidData)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('ID da loja é obrigatório')
    })

    it('should reject approval with missing userId', () => {
      const invalidData = {
        storeId: 'store123',
        userId: '',
        userRole: 'super_admin'
      }

      const result = validateStoreApproval(invalidData)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('ID do usuário é obrigatório')
    })

    it('should reject approval with insufficient role', () => {
      const invalidData = {
        storeId: 'store123',
        userId: 'user456',
        userRole: 'admin'
      }

      const result = validateStoreApproval(invalidData)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Usuário deve ter permissão de super administrador')
    })

    it('should reject approval with missing role', () => {
      const invalidData = {
        storeId: 'store123',
        userId: 'user456',
        userRole: ''
      }

      const result = validateStoreApproval(invalidData)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Usuário deve ter permissão de super administrador')
    })
  })

  describe('validateStoreRejection', () => {
    it('should validate correct rejection data without reason', () => {
      const validData = {
        storeId: 'store123',
        userId: 'user456',
        userRole: 'super_admin'
      }

      const result = validateStoreRejection(validData)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should validate correct rejection data with reason', () => {
      const validData = {
        storeId: 'store123',
        userId: 'user456',
        userRole: 'super_admin',
        reason: 'Documentação incompleta'
      }

      const result = validateStoreRejection(validData)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject rejection with short reason', () => {
      const invalidData = {
        storeId: 'store123',
        userId: 'user456',
        userRole: 'super_admin',
        reason: 'No'
      }

      const result = validateStoreRejection(invalidData)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Motivo da rejeição deve ter pelo menos 3 caracteres')
    })

    it('should reject rejection with missing storeId', () => {
      const invalidData = {
        storeId: '',
        userId: 'user456',
        userRole: 'super_admin'
      }

      const result = validateStoreRejection(invalidData)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('ID da loja é obrigatório')
    })

    it('should reject rejection with missing userId', () => {
      const invalidData = {
        storeId: 'store123',
        userId: '',
        userRole: 'super_admin'
      }

      const result = validateStoreRejection(invalidData)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('ID do usuário é obrigatório')
    })

    it('should reject rejection with insufficient role', () => {
      const invalidData = {
        storeId: 'store123',
        userId: 'user456',
        userRole: 'admin'
      }

      const result = validateStoreRejection(invalidData)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Usuário deve ter permissão de super administrador')
    })
  })
}) 