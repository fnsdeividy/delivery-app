export interface PaymentMethod {
  id: string
  name: string
  type: 'card' | 'pix' | 'cash' | 'transfer' | 'digital_wallet'
  enabled: boolean
  fee: number
  feeType: 'percentage' | 'fixed'
  minAmount?: number
  maxAmount?: number
  description?: string
  icon: string
  requiresChange?: boolean
  changeAmount?: number
}

export interface PaymentConfig {
  methods: PaymentMethod[]
  autoAccept: boolean
  requireConfirmation: boolean
  allowPartialPayment: boolean
  defaultMethod?: string
}