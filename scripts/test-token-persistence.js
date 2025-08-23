/**
 * Script para testar a persistência do token
 * Execute com: node scripts/test-token-persistence.js
 */

// Simular ambiente do navegador
global.window = {
  location: {
    protocol: 'http:'
  }
}

global.document = {
  cookie: '',
  addEventListener: () => { },
  removeEventListener: () => { }
}

global.localStorage = {
  data: {},
  getItem(key) {
    return this.data[key] || null
  },
  setItem(key, value) {
    this.data[key] = value
  },
  removeItem(key) {
    delete this.data[key]
  }
}

// Testar persistência do token
function testTokenPersistence() {
  console.log('🧪 Testando persistência do token...\n')

  // Simular token
  const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

  // Testar localStorage
  console.log('1. Testando localStorage...')
  localStorage.setItem('cardapio_token', testToken)
  const storedToken = localStorage.getItem('cardapio_token')
  console.log(`   Token armazenado: ${storedToken ? '✅' : '❌'}`)
  console.log(`   Comprimento: ${storedToken ? storedToken.length : 0}`)

  // Testar cookie
  console.log('\n2. Testando cookie...')
  const cookieValue = `cardapio_token=${testToken}; path=/; max-age=86400; SameSite=Lax; secure=false`
  document.cookie = cookieValue

  // Verificar se cookie foi definido
  const cookieSet = document.cookie.includes('cardapio_token=')
  console.log(`   Cookie definido: ${cookieSet ? '✅' : '❌'}`)
  console.log(`   Cookie atual: ${document.cookie}`)

  // Testar recuperação
  console.log('\n3. Testando recuperação...')
  const recoveredFromStorage = localStorage.getItem('cardapio_token')
  const recoveredFromCookie = document.cookie.includes('cardapio_token=')

  console.log(`   Recuperado do localStorage: ${recoveredFromStorage ? '✅' : '❌'}`)
  console.log(`   Recuperado do cookie: ${recoveredFromCookie ? '✅' : '❌'}`)

  // Testar limpeza
  console.log('\n4. Testando limpeza...')
  localStorage.removeItem('cardapio_token')
  document.cookie = 'cardapio_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'

  const clearedFromStorage = !localStorage.getItem('cardapio_token')
  const clearedFromCookie = !document.cookie.includes('cardapio_token=')

  console.log(`   Limpo do localStorage: ${clearedFromStorage ? '✅' : '❌'}`)
  console.log(`   Limpo do cookie: ${clearedFromCookie ? '✅' : '❌'}`)

  console.log('\n🎯 Teste concluído!')
}

// Executar teste
testTokenPersistence()
