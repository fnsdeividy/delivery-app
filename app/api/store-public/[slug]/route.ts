import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    
    // Por enquanto, retornar dados mock para testar
    const mockData = {
      store: {
        id: '1',
        name: `Loja ${slug}`,
        slug: slug,
        description: 'Descrição da loja',
        active: true,
        approved: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      config: {
        address: 'Endereço da loja',
        phone: '(11) 99999-9999',
        email: 'contato@loja.com',
        logo: '',
        banner: '',
        category: 'Restaurante',
        deliveryFee: 5,
        minimumOrder: 20,
        estimatedDeliveryTime: 45,
        businessHours: {
          monday: { open: true, openTime: '08:00', closeTime: '18:00' },
          tuesday: { open: true, openTime: '08:00', closeTime: '18:00' },
          wednesday: { open: true, openTime: '08:00', closeTime: '18:00' },
          thursday: { open: true, openTime: '08:00', closeTime: '18:00' },
          friday: { open: true, openTime: '08:00', closeTime: '18:00' },
          saturday: { open: true, openTime: '08:00', closeTime: '18:00' },
          sunday: { open: false, openTime: '', closeTime: '' }
        },
        paymentMethods: ['PIX', 'CARTÃO', 'DINHEIRO']
      },
      products: [
        {
          id: '1',
          name: 'Produto 1',
          description: 'Descrição do produto 1',
          price: 25.90,
          image: '',
          active: true,
          categoryId: '1',
          storeSlug: slug,
          ingredients: [],
          addons: [],
          tags: ['popular'],
          tagColor: 'orange',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      categories: [
        {
          id: '1',
          name: 'Categoria 1',
          description: 'Descrição da categoria',
          order: 1,
          active: true,
          storeSlug: slug,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      status: {
        isOpen: true,
        reason: 'Loja aberta'
      }
    }
    
    return NextResponse.json(mockData)
    
  } catch (error) {
    console.error('Erro ao buscar loja pública:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: 'Falha ao buscar dados da loja'
      },
      { status: 500 }
    )
  }
} 