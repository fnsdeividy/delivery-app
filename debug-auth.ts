import bcrypt from 'bcryptjs'
import { db } from './lib/db'

async function checkAuth() {
  try {
    console.log('🔍 Verificando usuário admin@boteco.com...')
    
    const user = await db.user.findUnique({
      where: { email: 'admin@boteco.com' },
      include: { store: true }
    })
    
    if (!user) {
      console.log('❌ Usuário não encontrado')
      return
    }
    
    console.log('✅ Usuário encontrado:', {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      storeSlug: user.storeSlug,
      active: user.active,
      hasPassword: !!user.password
    })
    
    if (user.password) {
      console.log('🔑 Testando senhas...')
      const isValid123456 = await bcrypt.compare('123456', user.password)
      const isValidAdmin123 = await bcrypt.compare('admin123', user.password)
      
      console.log('Senha 123456:', isValid123456 ? '✅' : '❌')
      console.log('Senha admin123:', isValidAdmin123 ? '✅' : '❌')
    }
    
    console.log('✅ Debug concluído')
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await db.$disconnect()
  }
}

checkAuth()