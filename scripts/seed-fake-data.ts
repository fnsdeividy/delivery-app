/**
 * Script para Popular o Banco com Dados Fake Interessantes
 * Cria lojas, produtos, clientes e pedidos realistas para teste
 */

import { OrderStatus, OrderType, PaymentStatus, PrismaClient, StockMovementType, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

const FAKE_STORES = [
  {
    slug: 'pizzaria-bella-vista',
    name: 'Pizzaria Bella Vista',
    description: 'A melhor pizza da cidade com massa artesanal e ingredientes frescos',
    config: {
      branding: {
        primaryColor: '#d4343a',
        secondaryColor: '#2c5530',
        backgroundColor: '#f8f9fa',
        textColor: '#333333',
        accentColor: '#ffd700'
      },
      business: {
        phone: '(11) 3456-7890',
        email: 'contato@bellavista.com',
        whatsapp: '+5511987654321'
      }
    }
  },
  {
    slug: 'burger-station',
    name: 'Burger Station',
    description: 'Hambúrguers artesanais com carne angus e pães brioche',
    config: {
      branding: {
        primaryColor: '#ff6b35',
        secondaryColor: '#2c3e50',
        backgroundColor: '#f8f9fa',
        textColor: '#333333',
        accentColor: '#f39c12'
      },
      business: {
        phone: '(11) 2345-6789',
        email: 'pedidos@burgerstation.com',
        whatsapp: '+5511876543210'
      }
    }
  },
  {
    slug: 'sushi-zen',
    name: 'Sushi Zen',
    description: 'Culinária japonesa autêntica com peixes frescos diários',
    config: {
      branding: {
        primaryColor: '#e74c3c',
        secondaryColor: '#2c3e50',
        backgroundColor: '#ecf0f1',
        textColor: '#2c3e50',
        accentColor: '#3498db'
      },
      business: {
        phone: '(11) 3987-6543',
        email: 'sac@sushizen.com',
        whatsapp: '+5511765432109'
      }
    }
  },
  {
    slug: 'taco-loco',
    name: 'Taco Loco',
    description: 'Comida mexicana autêntica com temperos especiais',
    config: {
      branding: {
        primaryColor: '#f39c12',
        secondaryColor: '#e74c3c',
        backgroundColor: '#fff8dc',
        textColor: '#8b4513',
        accentColor: '#27ae60'
      },
      business: {
        phone: '(11) 4567-8901',
        email: 'hola@tacoloco.com',
        whatsapp: '+5511654321098'
      }
    }
  }
]

const CATEGORIES = [
  { name: 'Pizzas', description: 'Pizzas tradicionais e especiais' },
  { name: 'Hambúrguers', description: 'Hambúrguers artesanais' },
  { name: 'Sushis', description: 'Peças tradicionais de sushi' },
  { name: 'Rolls', description: 'Rolls especiais' },
  { name: 'Tacos', description: 'Tacos autênticos mexicanos' },
  { name: 'Quesadillas', description: 'Quesadillas variadas' },
  { name: 'Bebidas', description: 'Bebidas geladas e sucos' },
  { name: 'Sobremesas', description: 'Doces e sobremesas' }
]

const PRODUCTS_BY_STORE = {
  'pizzaria-bella-vista': [
    {
      name: 'Pizza Margherita',
      description: 'Molho de tomate, mussarela, manjericão fresco e azeite extra virgem',
      price: 32.90,
      category: 'Pizzas',
      image: '/images/pizza-margherita.jpg',
      ingredients: ['Molho de tomate', 'Mussarela', 'Manjericão', 'Azeite'],
      addons: [
        { name: 'Borda recheada', price: 8.00 },
        { name: 'Queijo extra', price: 5.00 },
        { name: 'Azeitona', price: 3.00 }
      ]
    },
    {
      name: 'Pizza Calabresa',
      description: 'Molho de tomate, mussarela, calabresa, cebola e orégano',
      price: 36.90,
      category: 'Pizzas',
      image: '/images/pizza-calabresa.jpg',
      ingredients: ['Molho de tomate', 'Mussarela', 'Calabresa', 'Cebola', 'Orégano'],
      addons: [
        { name: 'Borda recheada', price: 8.00 },
        { name: 'Calabresa extra', price: 6.00 },
        { name: 'Pimenta', price: 2.00 }
      ]
    },
    {
      name: 'Pizza Quatro Queijos',
      description: 'Mussarela, gorgonzola, parmesão, provolone e orégano',
      price: 42.90,
      category: 'Pizzas',
      image: '/images/pizza-4queijos.jpg',
      ingredients: ['Mussarela', 'Gorgonzola', 'Parmesão', 'Provolone', 'Orégano'],
      addons: [
        { name: 'Borda recheada', price: 8.00 },
        { name: 'Mel', price: 4.00 },
        { name: 'Nozes', price: 7.00 }
      ]
    }
  ],
  'burger-station': [
    {
      name: 'Classic Burger',
      description: 'Hambúrguer de carne angus, queijo cheddar, alface, tomate e molho especial',
      price: 28.90,
      category: 'Hambúrguers',
      image: '/images/classic-burger.jpg',
      ingredients: ['Carne angus', 'Queijo cheddar', 'Alface', 'Tomate', 'Molho especial'],
      addons: [
        { name: 'Bacon', price: 6.00 },
        { name: 'Batata frita', price: 8.00 },
        { name: 'Onion rings', price: 7.00 }
      ]
    },
    {
      name: 'BBQ Bacon Burger',
      description: 'Duplo hambúrguer, bacon crocante, queijo, cebola crispy e molho BBQ',
      price: 34.90,
      category: 'Hambúrguers',
      image: '/images/bbq-burger.jpg',
      ingredients: ['Duplo hambúrguer', 'Bacon', 'Queijo', 'Cebola crispy', 'Molho BBQ'],
      addons: [
        { name: 'Batata frita', price: 8.00 },
        { name: 'Cheddar extra', price: 4.00 },
        { name: 'Jalapeño', price: 3.00 }
      ]
    }
  ],
  'sushi-zen': [
    {
      name: 'Combinado Salmão',
      description: '10 peças variadas de salmão: sashimi, nigiri e uramaki',
      price: 45.90,
      category: 'Sushis',
      image: '/images/combo-salmao.jpg',
      ingredients: ['Salmão fresco', 'Arroz japonês', 'Nori', 'Wasabi'],
      addons: [
        { name: 'Shoyu premium', price: 3.00 },
        { name: 'Gengibre extra', price: 2.00 },
        { name: 'Hot philadelphia', price: 12.00 }
      ]
    },
    {
      name: 'Temaki Salmão',
      description: 'Cone de alga com salmão, cream cheese, pepino e cebolinha',
      price: 18.90,
      category: 'Rolls',
      image: '/images/temaki-salmao.jpg',
      ingredients: ['Salmão', 'Cream cheese', 'Pepino', 'Cebolinha', 'Nori'],
      addons: [
        { name: 'Salmão extra', price: 8.00 },
        { name: 'Skin crocante', price: 4.00 }
      ]
    }
  ],
  'taco-loco': [
    {
      name: 'Taco Carne Asada',
      description: 'Carne grelhada temperada, guacamole, cebola roxa e coentro',
      price: 16.90,
      category: 'Tacos',
      image: '/images/taco-carne.jpg',
      ingredients: ['Carne grelhada', 'Guacamole', 'Cebola roxa', 'Coentro', 'Tortilla'],
      addons: [
        { name: 'Queijo extra', price: 3.00 },
        { name: 'Jalapeño', price: 2.00 },
        { name: 'Molho picante', price: 1.50 }
      ]
    },
    {
      name: 'Quesadilla Pollo',
      description: 'Frango desfiado, queijos derretidos, pimentão e cebola',
      price: 22.90,
      category: 'Quesadillas',
      image: '/images/quesadilla-pollo.jpg',
      ingredients: ['Frango desfiado', 'Queijo mexicano', 'Pimentão', 'Cebola'],
      addons: [
        { name: 'Guacamole', price: 5.00 },
        { name: 'Sour cream', price: 3.00 }
      ]
    }
  ]
}

const FAKE_CUSTOMERS = [
  { name: 'Maria Silva', email: 'maria.silva@email.com', phone: '11987654321' },
  { name: 'João Santos', email: 'joao.santos@email.com', phone: '11876543210' },
  { name: 'Ana Costa', email: 'ana.costa@email.com', phone: '11765432109' },
  { name: 'Pedro Oliveira', email: 'pedro.oliveira@email.com', phone: '11654321098' },
  { name: 'Carla Souza', email: 'carla.souza@email.com', phone: '11543210987' },
  { name: 'Lucas Ferreira', email: 'lucas.ferreira@email.com', phone: '11432109876' },
  { name: 'Juliana Lima', email: 'juliana.lima@email.com', phone: '11321098765' },
  { name: 'Roberto Alves', email: 'roberto.alves@email.com', phone: '11210987654' }
]

async function createStores() {
  console.log('🏪 Criando lojas fake...')
  
  for (const storeData of FAKE_STORES) {
    const existingStore = await db.store.findUnique({
      where: { slug: storeData.slug }
    })

    if (!existingStore) {
      await db.store.create({
        data: {
          slug: storeData.slug,
          name: storeData.name,
          description: storeData.description,
          config: storeData.config,
          active: true
        }
      })
      console.log(`✅ Loja criada: ${storeData.name}`)
    }
  }
}

async function createUsers() {
  console.log('👥 Criando usuários fake...')
  
  // Super Admin
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const superAdminExists = await db.user.findUnique({
    where: { email: 'superadmin@cardap.io' }
  })

  if (!superAdminExists) {
    await db.user.create({
      data: {
        email: 'superadmin@cardap.io',
        password: hashedPassword,
        name: 'Super Admin',
        role: UserRole.SUPER_ADMIN,
        active: true
      }
    })
  }

  // Lojistas para cada loja
  for (let i = 0; i < FAKE_STORES.length; i++) {
    const store = FAKE_STORES[i]
    const email = `admin@${store.slug.replace('-', '')}.com`
    
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (!existingUser) {
      const hashedPass = await bcrypt.hash('123456', 12)
      await db.user.create({
        data: {
          email,
          password: hashedPass,
          name: `Admin ${store.name}`,
          role: UserRole.ADMIN,
          storeSlug: store.slug,
          active: true
        }
      })
      console.log(`✅ Lojista criado: ${email}`)
    }
  }

  // Clientes
  for (const customer of FAKE_CUSTOMERS) {
    const email = customer.email
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (!existingUser) {
      const hashedPass = await bcrypt.hash('123456', 12)
      await db.user.create({
        data: {
          email,
          password: hashedPass,
          name: customer.name,
          role: UserRole.CLIENTE,
          active: true
        }
      })
    }
  }
  console.log('✅ Usuários criados!')
}

async function createProductsAndCategories() {
  console.log('🍕 Criando produtos e categorias...')
  
  for (const storeData of FAKE_STORES) {
    const storeSlug = storeData.slug
    
    // Criar categorias para esta loja
    for (const catData of CATEGORIES) {
      const existingCategory = await db.category.findFirst({
        where: { 
          storeSlug: storeSlug,
          name: catData.name 
        }
      })

      if (!existingCategory) {
        await db.category.create({
          data: {
            name: catData.name,
            description: catData.description,
            order: 0,
            active: true,
            storeSlug: storeSlug
          }
        })
      }
    }

    // Criar produtos para esta loja
    const storeProducts = PRODUCTS_BY_STORE[storeSlug as keyof typeof PRODUCTS_BY_STORE] || []
    
    for (const productData of storeProducts) {
      const category = await db.category.findFirst({
        where: { 
          storeSlug: storeSlug,
          name: productData.category 
        }
      })

      if (!category) continue

      const existingProduct = await db.product.findFirst({
        where: { 
          storeSlug: storeSlug,
          name: productData.name 
        }
      })

      if (!existingProduct) {
        const product = await db.product.create({
          data: {
            name: productData.name,
            description: productData.description,
            price: productData.price,
            image: productData.image,
            active: true,
            categoryId: category.id,
            storeSlug: storeSlug,
            tags: ['Popular', 'Recomendado'],
            tagColor: '#ed7516'
          }
        })

        // Adicionar ingredientes
        for (const ingredient of productData.ingredients) {
          await db.productIngredient.create({
            data: {
              name: ingredient,
              included: true,
              removable: true,
              productId: product.id
            }
          })
        }

        // Adicionar adicionais
        for (const addon of productData.addons) {
          await db.productAddon.create({
            data: {
              name: addon.name,
              price: addon.price,
              active: true,
              productId: product.id
            }
          })
        }

        // Criar estoque inicial
        const randomStock = Math.floor(Math.random() * 50) + 20 // 20-70 itens
        await db.inventory.create({
          data: {
            productId: product.id,
            quantity: randomStock,
            minStock: 5,
            storeSlug: storeSlug
          }
        })

        console.log(`✅ Produto criado: ${productData.name} (${storeData.name})`)
      }
    }
  }
}

async function createCustomers() {
  console.log('👤 Criando clientes...')
  
  for (const storeData of FAKE_STORES) {
    // Criar alguns clientes para cada loja
    for (let i = 0; i < 3; i++) {
      const customerData = FAKE_CUSTOMERS[i % FAKE_CUSTOMERS.length]
      
      const existingCustomer = await db.customer.findFirst({
        where: { 
          storeSlug: storeData.slug,
          phone: customerData.phone 
        }
      })

      if (!existingCustomer) {
        await db.customer.create({
          data: {
            name: customerData.name,
            email: customerData.email,
            phone: customerData.phone,
            storeSlug: storeData.slug,
            address: {
              street: 'Rua das Flores',
              number: '123',
              neighborhood: 'Centro',
              city: 'São Paulo',
              state: 'SP',
              zipCode: '01234-567'
            }
          }
        })
      }
    }
  }
  console.log('✅ Clientes criados!')
}

async function createOrders() {
  console.log('🛒 Criando pedidos fake...')
  
  for (const storeData of FAKE_STORES) {
    const customers = await db.customer.findMany({
      where: { storeSlug: storeData.slug }
    })

    const products = await db.product.findMany({
      where: { storeSlug: storeData.slug },
      include: { addons: true }
    })

    // Criar 3-5 pedidos por loja
    for (let i = 0; i < Math.floor(Math.random() * 3) + 3; i++) {
      const randomCustomer = customers[Math.floor(Math.random() * customers.length)]
      const randomProduct = products[Math.floor(Math.random() * products.length)]
      
      if (!randomCustomer || !randomProduct) continue

      const orderNumber = `PED${Date.now().toString().slice(-6)}${i}`
      const quantity = Math.floor(Math.random() * 3) + 1
      const itemPrice = Number(randomProduct.price) * quantity
      const deliveryFee = 8.90
      const total = itemPrice + deliveryFee

      const order = await db.order.create({
        data: {
          orderNumber,
          subtotal: itemPrice,
          deliveryFee,
          discount: 0,
          total,
          status: [OrderStatus.RECEIVED, OrderStatus.PREPARING, OrderStatus.DELIVERED][Math.floor(Math.random() * 3)],
          type: Math.random() > 0.3 ? OrderType.DELIVERY : OrderType.PICKUP,
          paymentMethod: ['PIX', 'Cartão', 'Dinheiro'][Math.floor(Math.random() * 3)],
          paymentStatus: PaymentStatus.PAID,
          customerId: randomCustomer.id,
          storeSlug: storeData.slug,
          notes: i % 2 === 0 ? 'Sem cebola, por favor' : undefined
        }
      })

      // Adicionar item ao pedido
      await db.orderItem.create({
        data: {
          name: randomProduct.name,
          quantity,
          price: randomProduct.price,
          orderId: order.id,
          productId: randomProduct.id,
          customizations: {
            removedIngredients: i % 3 === 0 ? ['Cebola'] : [],
            addons: randomProduct.addons.length > 0 && Math.random() > 0.5 ? [
              {
                id: randomProduct.addons[0].id,
                name: randomProduct.addons[0].name,
                price: Number(randomProduct.addons[0].price),
                quantity: 1
              }
            ] : [],
            observations: i % 4 === 0 ? 'Bem passado' : undefined
          }
        }
      })

      console.log(`✅ Pedido criado: ${orderNumber} (${storeData.name})`)
    }
  }
}

async function createStockMovements() {
  console.log('📦 Criando movimentações de estoque...')
  
  const inventories = await db.inventory.findMany({
    include: { product: true }
  })

  for (const inventory of inventories) {
    // Entrada inicial
    await db.stockMovement.create({
      data: {
        type: StockMovementType.ENTRADA,
        quantity: inventory.quantity,
        reason: 'Estoque inicial',
        productId: inventory.productId,
        inventoryId: inventory.id
      }
    })

    // Algumas saídas aleatórias
    for (let i = 0; i < Math.floor(Math.random() * 3) + 1; i++) {
      const saidaQuantity = Math.floor(Math.random() * 5) + 1
      await db.stockMovement.create({
        data: {
          type: StockMovementType.SAIDA,
          quantity: saidaQuantity,
          reason: 'Venda',
          reference: `PED${Date.now().toString().slice(-6)}`,
          productId: inventory.productId,
          inventoryId: inventory.id
        }
      })
    }
  }
  console.log('✅ Movimentações de estoque criadas!')
}

async function main() {
  console.log('🎭 Populando banco com dados fake interessantes...')
  
  try {
    await createStores()
    await createUsers()
    await createProductsAndCategories()
    await createCustomers()
    await createOrders()
    await createStockMovements()
    
    console.log('\n🎉 Banco populado com sucesso!')
    console.log('\n📊 Dados criados:')
    console.log(`🏪 ${FAKE_STORES.length} lojas temáticas`)
    console.log(`👥 ${FAKE_CUSTOMERS.length + FAKE_STORES.length + 1} usuários`)
    console.log(`🍕 Produtos variados por loja`)
    console.log(`👤 Clientes com endereços`)
    console.log(`🛒 Pedidos com status realistas`)
    console.log(`📦 Movimentações de estoque`)
    
    console.log('\n🔗 Acesse:')
    console.log('📊 Prisma Studio: http://localhost:5556')
    console.log('🏪 Lojas criadas:')
    FAKE_STORES.forEach(store => {
      console.log(`   • ${store.name}: http://localhost:3000/store/${store.slug}`)
    })
    
  } catch (error) {
    console.error('💥 Erro ao popular banco:', error)
    throw error
  } finally {
    await db.$disconnect()
  }
}

if (require.main === module) {
  main()
}

export { main as seedFakeData }
