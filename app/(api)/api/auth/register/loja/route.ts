import bcrypt from 'bcryptjs'
import { existsSync } from 'fs'
import { mkdir, writeFile } from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { db } from '../../../../../../lib/db'
import { StoreConfig } from '../../../../../../types/store'

/**
 * API para registro de lojistas com criação de loja
 * POST /api/auth/register/loja
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      // Dados do proprietário
      ownerName,
      ownerEmail,
      ownerPhone,
      password,
      
      // Dados da loja
      storeName,
      storeSlug,
      description,
      category,
      
      // Endereço
      address,
      city,
      state,
      zipCode,
      
      // Configurações
      deliveryEnabled = true,
      deliveryFee = '5.00',
      minimumOrder = '20.00'
    } = body

    // Validações básicas
    if (!ownerName || !ownerEmail || !password || !storeName || !storeSlug || !category) {
      return NextResponse.json(
        { error: 'Todos os campos obrigatórios devem ser preenchidos' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Verificar se email já existe
    const existingUser = await db.user.findUnique({
      where: { email: ownerEmail }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email já está sendo usado' },
        { status: 409 }
      )
    }

    // Verificar se slug da loja já existe
    const existingStore = await db.store.findUnique({
      where: { slug: storeSlug }
    })

    if (existingStore) {
      return NextResponse.json(
        { error: 'Já existe uma loja com este slug' },
        { status: 409 }
      )
    }

    // Verificar se arquivo de configuração já existe
    const configDir = path.join(process.cwd(), 'config', 'stores')
    const configPath = path.join(configDir, `${storeSlug}.json`)

    if (existsSync(configPath)) {
      return NextResponse.json(
        { error: 'Já existe uma configuração para esta loja' },
        { status: 409 }
      )
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12)

    // Criar transação para garantir consistência
    const result = await db.$transaction(async (tx) => {
      // 1. Criar loja no banco
      const store = await tx.store.create({
        data: {
          slug: storeSlug,
          name: storeName,
          description: description || null,
          active: true,
          config: {}
        }
      })

      // 2. Criar usuário proprietário
      const user = await tx.user.create({
        data: {
          name: ownerName,
          email: ownerEmail,
          password: hashedPassword,
          phone: ownerPhone || null,
          role: 'ADMIN',
          active: true,
          storeSlug: storeSlug
        }
      })

      return { store, user }
    })

    // 3. Criar arquivo de configuração da loja
    const storeConfig: StoreConfig = {
      slug: storeSlug,
      name: storeName,
      description: description || '',
      branding: {
        primaryColor: '#ed7516',
        secondaryColor: '#f59e0b',
        backgroundColor: '#ffffff',
        textColor: '#000000',
        accentColor: '#dc2626',
        logo: '',
        favicon: ''
      },
      business: {
        phone: ownerPhone || '',
        email: ownerEmail,
        socialMedia: {
          instagram: '',
          facebook: '',
          whatsapp: ownerPhone || ''
        }
      },
      delivery: {
        enabled: deliveryEnabled,
        fee: parseFloat(deliveryFee),
        freeDeliveryMinimum: parseFloat(minimumOrder),
        radius: 10,
        estimatedTime: 30,
        areas: []
      },
      payments: {
        cash: true,
        pix: false,
        card: false,
        online: false,
        integrations: {}
      },
      schedule: {
        timezone: 'America/Sao_Paulo',
        workingHours: {
          monday: { open: true, hours: [{ start: '11:00', end: '22:00' }] },
          tuesday: { open: true, hours: [{ start: '11:00', end: '22:00' }] },
          wednesday: { open: true, hours: [{ start: '11:00', end: '22:00' }] },
          thursday: { open: true, hours: [{ start: '11:00', end: '22:00' }] },
          friday: { open: true, hours: [{ start: '11:00', end: '22:00' }] },
          saturday: { open: true, hours: [{ start: '11:00', end: '23:00' }] },
          sunday: { open: true, hours: [{ start: '11:00', end: '21:00' }] }
        },
        closedMessage: 'Estamos fechados no momento. Volte em nosso horário de funcionamento!',
        holidays: []
      },
      menu: {
        categories: [
          {
            id: 'categoria-1',
            name: category,
            description: `Categoria ${category}`,
            order: 1,
            active: true,
            image: ''
          }
        ],
        products: [],
        addons: []
      },
      settings: {
        preparationTime: 25,
        whatsappTemplate: 'Olá! Seu pedido está sendo preparado.',
        orderNotifications: true,
        customerRegistrationRequired: false,
        minimumOrderValue: parseFloat(minimumOrder)
      },
      promotions: {
        coupons: [],
        combos: []
      }
    }

    // Criar diretório se não existir
    if (!existsSync(configDir)) {
      await mkdir(configDir, { recursive: true })
    }

    // Salvar configuração
    await writeFile(configPath, JSON.stringify(storeConfig, null, 2), 'utf8')

    // Remover senha da resposta
    const { password: _, ...userWithoutPassword } = result.user

    return NextResponse.json(
      {
        message: 'Loja criada com sucesso',
        store: result.store,
        user: userWithoutPassword
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Erro ao criar loja:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}