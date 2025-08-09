import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const additionalCategories = [
  {
    name: 'Pizzas',
    description: 'Pizzas tradicionais e especiais',
    order: 7,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGl6emF8ZW58MHx8MHx8fDA%3D'
  },
  {
    name: 'Hambúrgueres',
    description: 'Hambúrgueres artesanais',
    order: 8,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YnVyZ2VyfGVufDB8fDB8fHww'
  },
  {
    name: 'Massas',
    description: 'Espaguete, lasanha e outras massas',
    order: 9,
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGFzdGF8ZW58MHx8MHx8fDA%3D'
  },
  {
    name: 'Carnes',
    description: 'Carnes grelhadas e assadas',
    order: 10,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWVhdHxlbnwwfHwwfHx8MA%3D%3D'
  },
  {
    name: 'Frutos do Mar',
    description: 'Peixes, camarões e frutos do mar',
    order: 11,
    image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2VhZm9vZHxlbnwwfHwwfHx8MA%3D%3D'
  },
  {
    name: 'Vegetariano',
    description: 'Opções vegetarianas e veganas',
    order: 12,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dmVnZXRhcmlhbnxlbnwwfHwwfHx8MA%3D%3D'
  },
  {
    name: 'Café da Manhã',
    description: 'Pães, ovos e opções matinais',
    order: 13,
    image: 'https://images.unsplash.com/photo-1494859802809-d069c3b71a8a?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YnJlYWtmYXN0fGVufDB8fDB8fHww'
  },
  {
    name: 'Lanches',
    description: 'Sanduíches e lanches rápidos',
    order: 14,
    image: 'https://images.unsplash.com/photo-1528735602786-469c5b27c0c0?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2FuZHdpY2h8ZW58MHx8MHx8fDA%3D'
  }
]

async function addMoreCategories() {
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
    
    // Criar categorias adicionais
    for (const category of additionalCategories) {
      const existingCategory = await prisma.category.findFirst({
        where: {
          name: category.name,
          storeSlug: storeSlug
        }
      })
      
      if (existingCategory) {
        console.log(`⚠️  Categoria "${category.name}" já existe`)
        continue
      }
      
      const newCategory = await prisma.category.create({
        data: {
          ...category,
          storeSlug: storeSlug,
          active: true
        }
      })
      
      console.log(`✅ Categoria criada: ${newCategory.name}`)
    }
    
    console.log('\n🎉 Categorias adicionais criadas com sucesso!')
    
    // Listar todas as categorias da loja
    const allCategories = await prisma.category.findMany({
      where: { storeSlug: storeSlug },
      orderBy: { order: 'asc' }
    })
    
    console.log('\n📋 Todas as categorias da loja:')
    allCategories.forEach(cat => {
      console.log(`  ${cat.order.toString().padStart(2)}. ${cat.name} (${cat.active ? 'Ativa' : 'Inativa'})`)
    })
    
  } catch (error) {
    console.error('❌ Erro ao criar categorias:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addMoreCategories() 