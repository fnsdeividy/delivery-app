#!/usr/bin/env node

/**
 * Script para testar a conectividade com o backend Cardap.IO Delivery
 * Uso: node scripts/test-backend-connection.js
 */

const http = require('http')
const https = require('https')

const BACKEND_URL = process.env.NEXT_PUBLIC_CARDAPIO_API_URL || 'http://localhost:3001/api/v1'
const HEALTH_ENDPOINT = '/health'

console.log('🔌 Testando conectividade com o backend Cardap.IO Delivery...')
console.log(`📍 URL: ${BACKEND_URL}`)
console.log('')

function testConnection() {
  return new Promise((resolve, reject) => {
    const url = new URL(BACKEND_URL)
    const isHttps = url.protocol === 'https:'
    const client = isHttps ? https : http
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + HEALTH_ENDPOINT,
      method: 'GET',
      timeout: 5000,
      headers: {
        'User-Agent': 'Cardap.IO Frontend Connection Test',
        'Accept': 'application/json'
      }
    }

    const req = client.request(options, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        try {
          const responseData = JSON.parse(data)
          resolve({
            status: res.statusCode,
            data: responseData,
            headers: res.headers
          })
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: data,
            headers: res.headers,
            parseError: error.message
          })
        }
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    req.on('timeout', () => {
      req.destroy()
      reject(new Error('Timeout: Backend não respondeu em 5 segundos'))
    })

    req.end()
  })
}

async function runTests() {
  console.log('🧪 Executando testes de conectividade...')
  console.log('')

  try {
    // Teste 1: Conectividade básica
    console.log('1️⃣ Testando conectividade básica...')
    const result = await testConnection()
    
    if (result.status === 200) {
      console.log('✅ Backend respondeu com sucesso!')
      console.log(`   Status: ${result.status}`)
      
      if (result.data && typeof result.data === 'object') {
        console.log('   Resposta:', JSON.stringify(result.data, null, 2))
      }
    } else {
      console.log(`⚠️  Backend respondeu com status ${result.status}`)
      console.log('   Resposta:', result.data)
    }
    
  } catch (error) {
    console.log('❌ Falha na conectividade com o backend')
    console.log(`   Erro: ${error.message}`)
    
    if (error.code === 'ECONNREFUSED') {
      console.log('')
      console.log('💡 Possíveis soluções:')
      console.log('   1. Verifique se o backend está rodando na porta 3001')
      console.log('   2. Verifique se não há firewall bloqueando a conexão')
      console.log('   3. Verifique se a URL está correta em .env.local')
      console.log('')
      console.log('   Para iniciar o desenvolvimento:')
      console.log('   - Backend: deve estar rodando em http://localhost:3001')
      console.log('   - Frontend: npm run dev (rodará na porta 3000)')
    }
  }

  console.log('')
  console.log('🔍 Verificando configuração do ambiente...')
  
  // Verificar variáveis de ambiente
  const envVars = {
    'NEXT_PUBLIC_CARDAPIO_API_URL': process.env.NEXT_PUBLIC_CARDAPIO_API_URL,
    'NODE_ENV': process.env.NODE_ENV,
    'PORT': process.env.PORT
  }

  Object.entries(envVars).forEach(([key, value]) => {
    if (value) {
      console.log(`   ${key}: ${value}`)
    } else {
      console.log(`   ${key}: ❌ Não definido`)
    }
  })

  console.log('')
  console.log('📋 Resumo da configuração:')
  console.log(`   Frontend: http://localhost:3000`)
  console.log(`   Backend: ${BACKEND_URL}`)
  console.log(`   Proxy: Todas as chamadas /api/* são redirecionadas para o backend`)
  
  console.log('')
  console.log('🚀 Para iniciar o desenvolvimento:')
  console.log('   1. Certifique-se de que o backend está rodando na porta 3001')
  console.log('   2. Execute: npm run dev')
  console.log('   3. Acesse: http://localhost:3000')
  console.log('   4. Use: npm run demo para ver as URLs de teste')
}

// Executar testes se o script for chamado diretamente
if (require.main === module) {
  runTests().catch(console.error)
}

module.exports = { testConnection, runTests } 