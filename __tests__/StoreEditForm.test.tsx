import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { StoreEditForm } from '../components/StoreEditForm'
import { useStore, useUpdateStore } from '../hooks'

// Mock dos hooks
jest.mock('../hooks', () => ({
  useStore: jest.fn(),
  useUpdateStore: jest.fn()
}))

const mockUseStore = useStore as jest.MockedFunction<typeof useStore>
const mockUseUpdateStore = useUpdateStore as jest.MockedFunction<typeof useUpdateStore>

describe('StoreEditForm', () => {
  const mockStoreData = {
    id: '1',
    name: 'Loja Teste',
    description: 'Descrição da loja',
    slug: 'loja-teste',
    active: true,
    config: {
      address: 'Rua Teste, 123',
      phone: '(11) 99999-9999',
      email: 'teste@loja.com',
      category: 'Restaurante',
      deliveryFee: 5.00,
      minimumOrder: 15.00,
      estimatedDeliveryTime: 30,
      businessHours: {
        monday: { open: true, openTime: '09:00', closeTime: '18:00' },
        tuesday: { open: true, openTime: '09:00', closeTime: '18:00' },
        wednesday: { open: true, openTime: '09:00', closeTime: '18:00' },
        thursday: { open: true, openTime: '09:00', closeTime: '18:00' },
        friday: { open: true, openTime: '09:00', closeTime: '18:00' },
        saturday: { open: true, openTime: '10:00', closeTime: '16:00' },
        sunday: { open: false }
      },
      paymentMethods: ['PIX', 'CARTÃO', 'DINHEIRO']
    }
  }

  const mockUpdateStoreMutation = {
    mutateAsync: jest.fn(),
    isPending: false,
    isError: false,
    isSuccess: false,
    error: null
  }

  beforeEach(() => {
    mockUseStore.mockReturnValue({
      data: mockStoreData,
      isLoading: false,
      error: null
    })

    mockUseUpdateStore.mockReturnValue(mockUpdateStoreMutation)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('deve renderizar o formulário com os dados da loja', () => {
    render(<StoreEditForm storeId="1" />)

    expect(screen.getByDisplayValue('Loja Teste')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Descrição da loja')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Rua Teste, 123')).toBeInTheDocument()
    expect(screen.getByDisplayValue('(11) 99999-9999')).toBeInTheDocument()
    expect(screen.getByDisplayValue('teste@loja.com')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Restaurante')).toBeInTheDocument()
    expect(screen.getByDisplayValue('5')).toBeInTheDocument()
    expect(screen.getByDisplayValue('15')).toBeInTheDocument()
    expect(screen.getByDisplayValue('30')).toBeInTheDocument()
  })

  it('deve atualizar campos aninhados corretamente', async () => {
    render(<StoreEditForm storeId="1" />)

    const addressInput = screen.getByDisplayValue('Rua Teste, 123')
    fireEvent.change(addressInput, { target: { value: 'Nova Rua, 456' } })

    expect(addressInput).toHaveValue('Nova Rua, 456')
  })

  it('deve validar campos obrigatórios', async () => {
    render(<StoreEditForm storeId="1" />)

    // Limpar campos obrigatórios
    const nameInput = screen.getByDisplayValue('Loja Teste')
    const addressInput = screen.getByDisplayValue('Rua Teste, 123')
    const phoneInput = screen.getByDisplayValue('(11) 99999-9999')
    const emailInput = screen.getByDisplayValue('teste@loja.com')

    fireEvent.change(nameInput, { target: { value: '' } })
    fireEvent.change(addressInput, { target: { value: '' } })
    fireEvent.change(phoneInput, { target: { value: '' } })
    fireEvent.change(emailInput, { target: { value: '' } })

    const submitButton = screen.getByText('Salvar Alterações')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Nome da loja é obrigatório')).toBeInTheDocument()
      expect(screen.getByText('Endereço é obrigatório')).toBeInTheDocument()
      expect(screen.getByText('Telefone é obrigatório')).toBeInTheDocument()
      expect(screen.getByText('Email é obrigatório')).toBeInTheDocument()
    })
  })

  it('deve chamar onSuccess após atualização bem-sucedida', async () => {
    const onSuccess = jest.fn()
    mockUpdateStoreMutation.mutateAsync.mockResolvedValue({})

    render(<StoreEditForm storeId="1" onSuccess={onSuccess} />)

    const submitButton = screen.getByText('Salvar Alterações')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled()
    })
  })

  it('deve mostrar loading durante a atualização', () => {
    mockUseUpdateStore.mockReturnValue({
      ...mockUpdateStoreMutation,
      isPending: true
    })

    render(<StoreEditForm storeId="1" />)

    expect(screen.getByText('Salvando...')).toBeInTheDocument()
    expect(screen.getByText('Salvando...')).toBeDisabled()
  })
}) 