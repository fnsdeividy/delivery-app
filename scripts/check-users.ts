import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUsers() {
  console.log('🔍 Verificando usuários no banco de dados...')

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        storeSlug: true,
        createdAt: true
      }
    })

    console.log('\n📋 Usuários encontrados:')
    console.log('='.repeat(80))
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Ativo: ${user.active ? '✅' : '❌'}`)
      console.log(`   Loja: ${user.storeSlug || 'N/A'}`)
      console.log(`   Criado: ${user.createdAt.toLocaleString('pt-BR')}`)
      console.log('')
    })

    // Verificar lojas
    const stores = await prisma.store.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        active: true,
        createdAt: true
      }
    })

    console.log('🏪 Lojas encontradas:')
    console.log('='.repeat(80))
    
    stores.forEach((store, index) => {
      console.log(`${index + 1}. ${store.name}`)
      console.log(`   Slug: ${store.slug}`)
      console.log(`   Ativa: ${store.active ? '✅' : '❌'}`)
      console.log(`   Criada: ${store.createdAt.toLocaleString('pt-BR')}`)
      console.log('')
    })

    // Verificar se o lojista tem a loja correta
    const lojista = users.find(u => u.email === 'joao@botecodojao.com')
    if (lojista) {
      console.log('👨‍💼 Status do Lojista:')
      console.log('='.repeat(80))
      console.log(`Nome: ${lojista.name}`)
      console.log(`Email: ${lojista.email}`)
      console.log(`Role: ${lojista.role}`)
      console.log(`Ativo: ${lojista.active ? '✅' : '❌'}`)
      console.log(`Loja: ${lojista.storeSlug || '❌ Nenhuma loja associada'}`)
      
      if (lojista.storeSlug) {
        const loja = stores.find(s => s.slug === lojista.storeSlug)
        if (loja) {
          console.log(`Loja encontrada: ${loja.name} ✅`)
        } else {
          console.log(`❌ Loja não encontrada no banco`)
        }
      }
    } else {
      console.log('❌ Lojista não encontrado no banco')
    }

  } catch (error) {
    console.error('❌ Erro ao verificar usuários:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()
  .then(() => {
    console.log('\n✅ Verificação concluída!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erro na verificação:', error)
    process.exit(1)
  }) 