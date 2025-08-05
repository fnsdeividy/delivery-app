/**
 * Script de Setup do Banco de Dados
 * Cria as tabelas e executa a migração inicial
 */

import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

async function setupDatabase() {
  console.log('🚀 Configurando banco de dados...')
  
  try {
    // 1. Executar migration para criar as tabelas
    console.log('📊 Criando tabelas do banco...')
    await execAsync('npx prisma migrate dev --name init')
    console.log('✅ Tabelas criadas com sucesso!')
    
    // 2. Gerar cliente Prisma
    console.log('🔧 Gerando cliente Prisma...')
    await execAsync('npx prisma generate')
    console.log('✅ Cliente Prisma gerado!')
    
    // 3. Executar migração dos dados
    console.log('📦 Migrando dados dos JSONs...')
    await execAsync('npx ts-node scripts/migrate-data.ts')
    console.log('✅ Dados migrados com sucesso!')
    
    console.log('\n🎉 Setup do banco concluído!')
    console.log('\n📋 Dados para teste:')
    console.log('✅ Super Admin: superadmin@cardap.io / admin123')
    console.log('✅ Lojista: admin@boteco.com / 123456')
    console.log('✅ Cliente: cliente@teste.com / 123456')
    
  } catch (error) {
    console.error('💥 Erro no setup:', error)
    process.exit(1)
  }
}

// Execute if this file is run directly
setupDatabase()

export { setupDatabase }
