import { config } from 'dotenv'
import { resolve } from 'path'
import { getRedisClient } from '../lib/redis'

// Carregar variáveis de ambiente
config({ path: resolve(__dirname, '../.env.local') })

async function clearCache() {
  try {
    console.log('🧹 Limpando cache do Redis...')
    
    const redis = getRedisClient()
    if (!redis) {
      console.log('ℹ️  Redis não configurado ou não disponível')
      return
    }
    
    // Conectar ao Redis
    if (redis.status !== 'ready') {
      await redis.connect()
    }
    
    // Limpar todas as chaves relacionadas à loja
    const keys = await redis.keys('store:restaurante-teste:*')
    
    if (keys.length > 0) {
      console.log(`📋 Encontradas ${keys.length} chaves de cache:`)
      keys.forEach(key => console.log(`  - ${key}`))
      
      // Deletar todas as chaves
      await redis.del(...keys)
      console.log('✅ Cache limpo com sucesso!')
    } else {
      console.log('ℹ️  Nenhuma chave de cache encontrada')
    }
    
    // Verificar se há outras chaves de cache
    const allKeys = await redis.keys('*')
    console.log(`\n📊 Total de chaves no Redis: ${allKeys.length}`)
    
    if (allKeys.length > 0) {
      console.log('🔍 Outras chaves encontradas:')
      allKeys.slice(0, 10).forEach(key => console.log(`  - ${key}`))
      if (allKeys.length > 10) {
        console.log(`  ... e mais ${allKeys.length - 10} chaves`)
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao limpar cache:', error)
  } finally {
    const redis = getRedisClient()
    if (redis) {
      await redis.quit()
    }
  }
}

clearCache() 