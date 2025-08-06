import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function cleanDatabase() {
  console.log('🧹 Iniciando limpeza do banco de dados...')

  try {
    // 1. Limpar todas as tabelas relacionadas
    console.log('📦 Limpando tabelas relacionadas...')
    
    await prisma.orderItem.deleteMany({})
    console.log('✅ OrderItems deletados')
    
    await prisma.order.deleteMany({})
    console.log('✅ Orders deletados')
    
    await prisma.customer.deleteMany({})
    console.log('✅ Customers deletados')
    
    await prisma.stockMovement.deleteMany({})
    console.log('✅ StockMovements deletados')
    
    await prisma.inventory.deleteMany({})
    console.log('✅ Inventory deletados')
    
    await prisma.productAddon.deleteMany({})
    console.log('✅ ProductAddons deletados')
    
    await prisma.productIngredient.deleteMany({})
    console.log('✅ ProductIngredients deletados')
    
    await prisma.product.deleteMany({})
    console.log('✅ Products deletados')
    
    await prisma.category.deleteMany({})
    console.log('✅ Categories deletados')
    
    await prisma.session.deleteMany({})
    console.log('✅ Sessions deletados')
    
    await prisma.account.deleteMany({})
    console.log('✅ Accounts deletados')
    
    await prisma.verificationToken.deleteMany({})
    console.log('✅ VerificationTokens deletados')
    
    await prisma.user.deleteMany({})
    console.log('✅ Users deletados')
    
    await prisma.store.deleteMany({})
    console.log('✅ Stores deletados')

    // 2. Criar 1 cliente master (SUPER_ADMIN)
    console.log('👑 Criando cliente master...')
    
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const masterUser = await prisma.user.create({
      data: {
        name: 'Administrador Master',
        email: 'admin@cardapio.com',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        active: true,
        phone: '(11) 99999-9999'
      }
    })
    console.log('✅ Cliente master criado:', masterUser.email)

    // 3. Criar 1 loja de teste
    console.log('🏪 Criando loja de teste...')
    
    const testStore = await prisma.store.create({
      data: {
        slug: 'boteco-do-joao',
        name: 'Boteco do João',
        description: 'O melhor boteco da cidade! Comida caseira e ambiente familiar.',
        active: true,
        config: {
          branding: {
            primaryColor: '#d97706',
            secondaryColor: '#92400e',
            backgroundColor: '#fef3c7',
            textColor: '#1f2937',
            accentColor: '#f59e0b',
            logo: '',
            favicon: '',
            bannerImage: ''
          },
          schedule: {
            workingHours: {
              monday: { open: true, hours: [{ start: '11:00', end: '23:00' }] },
              tuesday: { open: true, hours: [{ start: '11:00', end: '23:00' }] },
              wednesday: { open: true, hours: [{ start: '11:00', end: '23:00' }] },
              thursday: { open: true, hours: [{ start: '11:00', end: '23:00' }] },
              friday: { open: true, hours: [{ start: '11:00', end: '00:00' }] },
              saturday: { open: true, hours: [{ start: '11:00', end: '00:00' }] },
              sunday: { open: true, hours: [{ start: '12:00', end: '22:00' }] }
            },
            preparationTime: 20,
            timezone: 'America/Sao_Paulo'
          },
          payment: {
            methods: [
              {
                id: 'pix',
                name: 'PIX',
                type: 'pix',
                enabled: true,
                fee: 0,
                feeType: 'percentage',
                description: 'Pagamento instantâneo via PIX',
                icon: '💳',
                minAmount: 0.01,
                maxAmount: 10000
              },
              {
                id: 'credit_card',
                name: 'Cartão de Crédito',
                type: 'card',
                enabled: true,
                fee: 2.99,
                feeType: 'percentage',
                description: 'Visa, Mastercard, Elo e outros',
                icon: '💳',
                minAmount: 1,
                maxAmount: 5000
              },
              {
                id: 'cash',
                name: 'Dinheiro',
                type: 'cash',
                enabled: true,
                fee: 0,
                feeType: 'fixed',
                description: 'Pagamento em dinheiro na entrega',
                icon: '💵',
                requiresChange: true,
                changeAmount: 50
              }
            ],
            autoAccept: false,
            requireConfirmation: true,
            allowPartialPayment: false
          },
          delivery: {
            enabled: true,
            zones: [
              {
                id: 'zona-1',
                name: 'Centro',
                deliveryFee: 5.00,
                deliveryTime: 30,
                minOrder: 15.00
              }
            ],
            freeDeliveryThreshold: 50.00
          },
          notifications: {
            email: {
              enabled: true,
              orderConfirmation: true,
              orderStatus: true,
              marketing: false
            },
            push: {
              enabled: true,
              newOrders: true,
              orderUpdates: true
            }
          },
          security: {
            twoFactor: false,
            sessionTimeout: 24,
            maxLoginAttempts: 5
          }
        }
      }
    })
    console.log('✅ Loja de teste criada:', testStore.name)

    // 4. Criar 1 lojista (ADMIN) para a loja
    console.log('👨‍💼 Criando lojista...')
    
    const lojistaPassword = await bcrypt.hash('lojista123', 12)
    
    const lojista = await prisma.user.create({
      data: {
        name: 'João Silva',
        email: 'joao@botecodojao.com',
        password: lojistaPassword,
        role: 'ADMIN',
        active: true,
        phone: '(11) 88888-8888',
        storeSlug: 'boteco-do-joao'
      }
    })
    console.log('✅ Lojista criado:', lojista.email)

    // 5. Criar algumas categorias de exemplo
    console.log('📂 Criando categorias de exemplo...')
    
    const categories = await Promise.all([
      prisma.category.create({
        data: {
          name: 'Hambúrgueres',
          description: 'Os melhores hambúrgueres artesanais',
          order: 1,
          active: true,
          storeSlug: 'boteco-do-joao'
        }
      }),
      prisma.category.create({
        data: {
          name: 'Acompanhamentos',
          description: 'Batatas, saladas e outros acompanhamentos',
          order: 2,
          active: true,
          storeSlug: 'boteco-do-joao'
        }
      }),
      prisma.category.create({
        data: {
          name: 'Bebidas',
          description: 'Refrigerantes, sucos e cervejas',
          order: 3,
          active: true,
          storeSlug: 'boteco-do-joao'
        }
      }),
      prisma.category.create({
        data: {
          name: 'Sobremesas',
          description: 'Doces e sobremesas caseiras',
          order: 4,
          active: true,
          storeSlug: 'boteco-do-joao'
        }
      })
    ])
    console.log('✅ Categorias criadas:', categories.length)

    // 6. Criar alguns produtos de exemplo
    console.log('🍔 Criando produtos de exemplo...')
    
    const hamburguerCategory = categories[0]
    const acompanhamentosCategory = categories[1]
    const bebidasCategory = categories[2]
    const sobremesasCategory = categories[3]

    const products = await Promise.all([
      // Hambúrgueres
      prisma.product.create({
        data: {
          name: 'X-Burger',
          description: 'Hambúrguer artesanal com queijo, alface e tomate',
          price: 25.90,
          image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
          active: true,
          preparationTime: 15,
          categoryId: hamburguerCategory.id,
          storeSlug: 'boteco-do-joao',
          tags: ['popular', 'artesanal'],
          tagColor: '#ed7516'
        }
      }),
      prisma.product.create({
        data: {
          name: 'X-Bacon',
          description: 'Hambúrguer com bacon crocante e queijo',
          price: 32.90,
          image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&h=300&fit=crop',
          active: true,
          preparationTime: 18,
          categoryId: hamburguerCategory.id,
          storeSlug: 'boteco-do-joao',
          tags: ['bacon', 'premium'],
          tagColor: '#dc2626'
        }
      }),
      
      // Acompanhamentos
      prisma.product.create({
        data: {
          name: 'Batata Frita',
          description: 'Porção de batatas fritas crocantes',
          price: 12.50,
          image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop',
          active: true,
          preparationTime: 8,
          categoryId: acompanhamentosCategory.id,
          storeSlug: 'boteco-do-joao',
          tags: ['acompanhamento'],
          tagColor: '#059669'
        }
      }),
      
      // Bebidas
      prisma.product.create({
        data: {
          name: 'Refrigerante Cola',
          description: 'Refrigerante Coca-Cola 350ml',
          price: 8.00,
          image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&h=300&fit=crop',
          active: true,
          preparationTime: 2,
          categoryId: bebidasCategory.id,
          storeSlug: 'boteco-do-joao',
          tags: ['bebida'],
          tagColor: '#3b82f6'
        }
      }),
      
      // Sobremesas
      prisma.product.create({
        data: {
          name: 'Sorvete de Chocolate',
          description: 'Sorvete artesanal de chocolate com calda',
          price: 15.00,
          image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop',
          active: true,
          preparationTime: 5,
          categoryId: sobremesasCategory.id,
          storeSlug: 'boteco-do-joao',
          tags: ['sobremesa', 'doce'],
          tagColor: '#7c3aed'
        }
      })
    ])
    console.log('✅ Produtos criados:', products.length)

    // 7. Criar estoque para os produtos
    console.log('📦 Criando estoque...')
    
    await Promise.all(
      products.map(product =>
        prisma.inventory.create({
          data: {
            quantity: 50,
            minStock: 10,
            maxStock: 100,
            productId: product.id,
            storeSlug: 'boteco-do-joao'
          }
        })
      )
    )
    console.log('✅ Estoque criado para todos os produtos')

    // 8. Criar 1 cliente de teste
    console.log('👤 Criando cliente de teste...')
    
    const clientePassword = await bcrypt.hash('cliente123', 12)
    
    const cliente = await prisma.user.create({
      data: {
        name: 'Maria Santos',
        email: 'maria@email.com',
        password: clientePassword,
        role: 'CLIENTE',
        active: true,
        phone: '(11) 77777-7777'
      }
    })
    console.log('✅ Cliente criado:', cliente.email)

    // 9. Criar dados do cliente
    await prisma.customer.create({
      data: {
        name: 'Maria Santos',
        email: 'maria@email.com',
        phone: '(11) 77777-7777',
        storeSlug: 'boteco-do-joao',
        userId: cliente.id,
        address: {
          street: 'Rua das Flores, 123',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567'
        }
      }
    })
    console.log('✅ Dados do cliente criados')

    console.log('\n🎉 Limpeza do banco concluída com sucesso!')
    console.log('\n📋 Resumo dos dados criados:')
    console.log('👑 Cliente Master:', masterUser.email, '(admin@cardapio.com)')
    console.log('🏪 Loja:', testStore.name, '(boteco-do-joao)')
    console.log('👨‍💼 Lojista:', lojista.email, '(joao@botecodojao.com)')
    console.log('👤 Cliente:', cliente.email, '(maria@email.com)')
    console.log('📂 Categorias:', categories.length)
    console.log('🍔 Produtos:', products.length)
    
    console.log('\n🔑 Senhas de acesso:')
    console.log('Master: admin123')
    console.log('Lojista: lojista123')
    console.log('Cliente: cliente123')

  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Executar o script
cleanDatabase()
  .then(() => {
    console.log('\n✅ Script executado com sucesso!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erro no script:', error)
    process.exit(1)
  }) 