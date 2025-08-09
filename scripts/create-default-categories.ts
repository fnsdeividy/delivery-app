import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const defaultCategories = [
  {
    name: 'Comidas',
    description: 'Pratos principais e refeições',
    order: 1,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Zm9vZHxlbnwwfHwwfHx8MA%3D%3D'
  },
  {
    name: 'Bebidas',
    description: 'Refrigerantes, sucos e bebidas alcoólicas',
    order: 2,
    image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZHJpbmtzfGVufDB8fDB8fHww'
  },
  {
    name: 'Complementos',
    description: 'Acompanhamentos e extras',
    order: 3,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2lkZXxlbnwwfHwwfHx8MA%3D%3D'
  },
  {
    name: 'Sobremesas',
    description: 'Doces e sobremesas',
    order: 4,
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZGVzc2VydHxlbnwwfHwwfHx8MA%3D%3D'
  },
  {
    name: 'Entradas',
    description: 'Aperitivos e entradas',
    order: 5,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXBwZXRpemVyfGVufDB8fDB8fHww'
  },
  {
    name: 'Saladas',
    description: 'Saladas frescas e saudáveis',
    order: 6,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2FsYWR8ZW58MHx8MHx8fDA%3D'
  }
]

async function createDefaultCategories() {
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
    
    // Criar categorias
    for (const category of defaultCategories) {
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
    
    console.log('\n🎉 Categorias padrão criadas com sucesso!')
    
    // Listar todas as categorias da loja
    const allCategories = await prisma.category.findMany({
      where: { storeSlug: storeSlug },
      orderBy: { order: 'asc' }
    })
    
    console.log('\n📋 Categorias da loja:')
    allCategories.forEach(cat => {
      console.log(`  - ${cat.name} (${cat.active ? 'Ativa' : 'Inativa'})`)
    })
    
  } catch (error) {
    console.error('❌ Erro ao criar categorias:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createDefaultCategories() 