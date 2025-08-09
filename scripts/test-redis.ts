import Redis from 'ioredis'

async function testRedis() {
  try {
    console.log('🔍 Testando conexão com Redis...')
    console.log('REDIS_URL:', process.env.REDIS_URL || 'não definido')
    
    const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')
    
    redis.on('connect', () => {
      console.log('✅ Conectado ao Redis!')
    })
    
    redis.on('error', (err) => {
      console.error('❌ Erro no Redis:', err)
    })
    
    // Testar ping
    const pong = await redis.ping()
    console.log('🏓 Ping:', pong)
    
    // Testar set/get
    await redis.set('test', 'hello')
    const value = await redis.get('test')
    console.log('📝 Teste set/get:', value)
    
    // Limpar teste
    await redis.del('test')
    
    await redis.quit()
    console.log('✅ Teste concluído com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  }
}

testRedis() 