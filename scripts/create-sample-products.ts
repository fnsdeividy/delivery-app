import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const sampleProducts = [
  // Pizzas
  {
    name: 'Pizza Margherita',
    description: 'Molho de tomate, mussarela, manjericão fresco',
    price: 35.90,
    categoryName: 'Pizzas',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGl6emF8ZW58MHx8MHx8fDA%3D',
    tags: ['vegetariano'],
    tagColor: '#4ade80',
    preparationTime: 20,
    stock: 50,
    minStock: 10
  },
  {
    name: 'Pizza Pepperoni',
    description: 'Molho de tomate, mussarela, pepperoni',
    price: 42.90,
    categoryName: 'Pizzas',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGl6emF8ZW58MHx8MHx8fDA%3D',
    tags: [],
    tagColor: '#f97316',
    preparationTime: 25,
    stock: 30,
    minStock: 8
  },
  
  // Hambúrgueres
  {
    name: 'Hambúrguer Clássico',
    description: 'Pão, carne, alface, tomate, cebola, queijo',
    price: 28.90,
    categoryName: 'Hambúrgueres',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YnVyZ2VyfGVufDB8fDB8fHww',
    tags: [],
    tagColor: '#f97316',
    preparationTime: 15,
    stock: 40,
    minStock: 12
  },
  {
    name: 'Hambúrguer Vegetariano',
    description: 'Pão, hambúrguer de grão-de-bico, alface, tomate',
    price: 32.90,
    categoryName: 'Hambúrgueres',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YnVyZ2VyfGVufDB8fDB8fHww',
    tags: ['vegetariano', 'vegano'],
    tagColor: '#4ade80',
    preparationTime: 12,
    stock: 25,
    minStock: 8
  },
  
  // Bebidas
  {
    name: 'Coca-Cola 350ml',
    description: 'Refrigerante Coca-Cola',
    price: 6.90,
    categoryName: 'Bebidas',
    image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZHJpbmtzfGVufDB8fDB8fHww',
    tags: [],
    tagColor: '#f97316',
    preparationTime: 2,
    stock: 100,
    minStock: 20
  },
  {
    name: 'Suco de Laranja Natural',
    description: 'Suco de laranja fresco',
    price: 8.90,
    categoryName: 'Bebidas',
    image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZHJpbmtzfGVufDB8fDB8fHww',
    tags: ['natural'],
    tagColor: '#fbbf24',
    preparationTime: 5,
    stock: 30,
    minStock: 10
  },
  
  // Sobremesas
  {
    name: 'Pudim de Leite',
    description: 'Pudim de leite condensado com calda de caramelo',
    price: 12.90,
    categoryName: 'Sobremesas',
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZGVzc2VydHxlbnwwfHwwfHx8MA%3D%3D',
    tags: ['vegetariano'],
    tagColor: '#4ade80',
    preparationTime: 10,
    stock: 20,
    minStock: 5
  },
  {
    name: 'Sorvete de Chocolate',
    description: 'Sorvete cremoso de chocolate belga',
    price: 15.90,
    categoryName: 'Sobremesas',
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZGVzc2VydHxlbnwwfHwwfHx8MA%3D%3D',
    tags: ['vegetariano'],
    tagColor: '#4ade80',
    preparationTime: 3,
    stock: 35,
    minStock: 8
  },
  
  // Saladas
  {
    name: 'Salada Caesar',
    description: 'Alface, croutons, parmesão, molho caesar',
    price: 22.90,
    categoryName: 'Saladas',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2FsYWR8ZW58MHx8MHx8fDA%3D',
    tags: ['vegetariano'],
    tagColor: '#4ade80',
    preparationTime: 8,
    stock: 15,
    minStock: 5
  },
  {
    name: 'Salada de Frutas',
    description: 'Mix de frutas frescas da estação',
    price: 18.90,
    categoryName: 'Saladas',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2FsYWR8ZW58MHx8MHx8fDA%3D',
    tags: ['vegetariano', 'vegano', 'natural'],
    tagColor: '#4ade80',
    preparationTime: 6,
    stock: 12,
    minStock: 4
  }
]

async function createSampleProducts() {
  try {
    const storeSlug = 'restaurante-teste'
    
    // Verificar se a loja existe
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug }
    })
    
    if (!store) {
      console.log('❌ Loja não encontrada:', storeSlug)
      return
    }
    
    console.log('✅ Loja encontrada:', store.name)
    
    // Criar produtos
    for (const product of sampleProducts) {
      // Buscar categoria
      const category = await prisma.category.findFirst({
        where: {
          name: product.categoryName,
          storeSlug: storeSlug
        }
      })
      
      if (!category) {
        console.log(`⚠️  Categoria "${product.categoryName}" não encontrada`)
        continue
      }
      
      // Verificar se produto já existe
      const existingProduct = await prisma.product.findFirst({
        where: {
          name: product.name,
          storeSlug: storeSlug
        }
      })
      
      if (existingProduct) {
        console.log(`⚠️  Produto "${product.name}" já existe`)
        continue
      }
      
      // Criar produto
      const newProduct = await prisma.product.create({
        data: {
          name: product.name,
          description: product.description,
          price: product.price,
          image: product.image,
          tags: product.tags,
          tagColor: product.tagColor,
          preparationTime: product.preparationTime,
          categoryId: category.id,
          storeSlug: storeSlug,
          active: true,
          inventory: {
            create: {
              quantity: product.stock,
              minStock: product.minStock,
              storeSlug: storeSlug
            }
          }
        }
      })
      
      console.log(`✅ Produto criado: ${newProduct.name} (${product.categoryName})`)
    }
    
    console.log('\n🎉 Produtos de exemplo criados com sucesso!')
    
    // Listar produtos por categoria
    const categories = await prisma.category.findMany({
      where: { storeSlug: storeSlug },
      include: {
        products: {
          where: { active: true },
          orderBy: { name: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    })
    
    console.log('\n📋 Produtos por categoria:')
    categories.forEach(cat => {
      if (cat.products.length > 0) {
        console.log(`\n${cat.name}:`)
        cat.products.forEach(prod => {
          console.log(`  - ${prod.name} (R$ ${prod.price.toFixed(2)})`)
        })
      }
    })
    
  } catch (error) {
    console.error('❌ Erro ao criar produtos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createSampleProducts() 