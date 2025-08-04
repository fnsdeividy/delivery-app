// Mock data para informações do usuário

export interface UserData {
  id: string
  name: string
  email: string
  phone: string
  addresses: Address[]
  preferences: UserPreferences
  orderHistory: OrderSummary[]
  paymentMethods: PaymentMethod[]
}

export interface Address {
  id: string
  type: 'home' | 'work' | 'other'
  label: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
  isDefault: boolean
}

export interface UserPreferences {
  favoriteCategories: string[]
  dietaryRestrictions: string[]
  spicyLevel: 'none' | 'mild' | 'medium' | 'hot'
  notifications: {
    orderUpdates: boolean
    promotions: boolean
    newItems: boolean
  }
}

export interface PaymentMethod {
  id: string
  type: 'credit' | 'debit' | 'pix' | 'cash'
  label: string
  cardNumber?: string // Últimos 4 dígitos
  isDefault: boolean
}

export interface OrderSummary {
  id: string
  date: string
  total: number
  status: 'completed' | 'cancelled' | 'pending'
  deliveryType: 'delivery' | 'pickup' | 'waiter'
  itemCount: number
  restaurantName: string
}

// Mock do usuário logado
export const mockUser: UserData = {
  id: 'user_123',
  name: 'João Silva',
  email: 'joao.silva@email.com',
  phone: '(11) 99999-9999',
  addresses: [
    {
      id: 'addr_1',
      type: 'home',
      label: 'Casa',
      street: 'Rua das Flores',
      number: '123',
      complement: 'Apto 45',
      neighborhood: 'Vila Madalena',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '05435-000',
      isDefault: true
    },
    {
      id: 'addr_2',
      type: 'work',
      label: 'Trabalho',
      street: 'Av. Paulista',
      number: '1000',
      complement: 'Sala 1205',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
      isDefault: false
    },
    {
      id: 'addr_3',
      type: 'other',
      label: 'Casa da Mãe',
      street: 'Rua dos Jasmins',
      number: '456',
      neighborhood: 'Jardim Europa',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01452-000',
      isDefault: false
    }
  ],
  preferences: {
    favoriteCategories: ['Pizzas', 'Hambúrgueres', 'Sobremesas'],
    dietaryRestrictions: ['Sem lactose'],
    spicyLevel: 'medium',
    notifications: {
      orderUpdates: true,
      promotions: true,
      newItems: false
    }
  },
  paymentMethods: [
    {
      id: 'payment_1',
      type: 'credit',
      label: 'Cartão de Crédito ***1234',
      cardNumber: '1234',
      isDefault: true
    },
    {
      id: 'payment_2',
      type: 'pix',
      label: 'PIX - joao.silva@email.com',
      isDefault: false
    },
    {
      id: 'payment_3',
      type: 'debit',
      label: 'Cartão de Débito ***5678',
      cardNumber: '5678',
      isDefault: false
    }
  ],
  orderHistory: [
    {
      id: 'order_001',
      date: '2024-01-15',
      total: 89.50,
      status: 'completed',
      deliveryType: 'delivery',
      itemCount: 3,
      restaurantName: 'Cardap.IO'
    },
    {
      id: 'order_002',
      date: '2024-01-12',
      total: 45.90,
      status: 'completed',
      deliveryType: 'pickup',
      itemCount: 2,
      restaurantName: 'Cardap.IO'
    },
    {
      id: 'order_003',
      date: '2024-01-08',
      total: 125.30,
      status: 'completed',
      deliveryType: 'waiter',
      itemCount: 5,
      restaurantName: 'Cardap.IO'
    },
    {
      id: 'order_004',
      date: '2024-01-05',
      total: 67.80,
      status: 'cancelled',
      deliveryType: 'delivery',
      itemCount: 2,
      restaurantName: 'Cardap.IO'
    }
  ]
}

// Mock de diferentes usuários para testes
export const mockUsers: UserData[] = [
  mockUser,
  {
    id: 'user_456',
    name: 'Maria Santos',
    email: 'maria.santos@email.com',
    phone: '(11) 88888-8888',
    addresses: [
      {
        id: 'addr_4',
        type: 'home',
        label: 'Casa',
        street: 'Rua Augusta',
        number: '789',
        neighborhood: 'Consolação',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01305-000',
        isDefault: true
      }
    ],
    preferences: {
      favoriteCategories: ['Saladas', 'Sucos', 'Pratos Veganos'],
      dietaryRestrictions: ['Vegano', 'Sem glúten'],
      spicyLevel: 'none',
      notifications: {
        orderUpdates: true,
        promotions: false,
        newItems: true
      }
    },
    paymentMethods: [
      {
        id: 'payment_4',
        type: 'pix',
        label: 'PIX - maria.santos@email.com',
        isDefault: true
      }
    ],
    orderHistory: [
      {
        id: 'order_005',
        date: '2024-01-14',
        total: 32.50,
        status: 'completed',
        deliveryType: 'pickup',
        itemCount: 1,
        restaurantName: 'Cardap.IO'
      }
    ]
  },
  {
    id: 'user_789',
    name: 'Pedro Oliveira',
    email: 'pedro.oliveira@email.com',
    phone: '(11) 77777-7777',
    addresses: [
      {
        id: 'addr_5',
        type: 'home',
        label: 'Casa',
        street: 'Rua Oscar Freire',
        number: '321',
        complement: 'Casa 2',
        neighborhood: 'Jardins',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01426-000',
        isDefault: true
      }
    ],
    preferences: {
      favoriteCategories: ['Carnes', 'Churrasco', 'Cerveja'],
      dietaryRestrictions: [],
      spicyLevel: 'hot',
      notifications: {
        orderUpdates: true,
        promotions: true,
        newItems: true
      }
    },
    paymentMethods: [
      {
        id: 'payment_5',
        type: 'credit',
        label: 'Cartão de Crédito ***9999',
        cardNumber: '9999',
        isDefault: true
      },
      {
        id: 'payment_6',
        type: 'cash',
        label: 'Dinheiro',
        isDefault: false
      }
    ],
    orderHistory: [
      {
        id: 'order_006',
        date: '2024-01-16',
        total: 156.90,
        status: 'completed',
        deliveryType: 'waiter',
        itemCount: 4,
        restaurantName: 'Cardap.IO'
      },
      {
        id: 'order_007',
        date: '2024-01-13',
        total: 89.30,
        status: 'completed',
        deliveryType: 'delivery',
        itemCount: 3,
        restaurantName: 'Cardap.IO'
      }
    ]
  }
]

// Funções auxiliares
export const getUserById = (id: string): UserData | undefined => {
  return mockUsers.find(user => user.id === id)
}

export const getDefaultAddress = (user: UserData): Address | undefined => {
  return user.addresses.find(addr => addr.isDefault)
}

export const getDefaultPaymentMethod = (user: UserData): PaymentMethod | undefined => {
  return user.paymentMethods.find(payment => payment.isDefault)
}

export const formatAddress = (address: Address): string => {
  const complement = address.complement ? `, ${address.complement}` : ''
  return `${address.street}, ${address.number}${complement}, ${address.neighborhood} - ${address.city}/${address.state}`
}

export const formatPhone = (phone: string): string => {
  return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
}

export const getTotalOrderValue = (user: UserData): number => {
  return user.orderHistory
    .filter(order => order.status === 'completed')
    .reduce((total, order) => total + order.total, 0)
}

export const getCompletedOrdersCount = (user: UserData): number => {
  return user.orderHistory.filter(order => order.status === 'completed').length
}