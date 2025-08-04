#!/usr/bin/env node

const { spawn } = require('child_process')

// Cores ANSI para terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m'
}

// Função para colorir texto
const c = (color, text) => `${colors[color]}${text}${colors.reset}`

// Função para exibir informações do sistema
function showSystemInfo(port = 3000) {
  console.log('\n' + '='.repeat(80))
  console.log(c('blue', c('bright', '🏪 SISTEMA MULTI-TENANT - DELIVERY APP')))
  console.log('='.repeat(80))
  
  console.log(c('yellow', c('bright', '\n📱 LOJA DEMO:')))
  console.log(`   ${c('green', `http://localhost:${port}/loja/boteco-do-joao`)}`)
  console.log(`   Cardápio público com tema personalizado`)
  
  console.log(c('magenta', c('bright', '\n🔐 DASHBOARD ADMIN:')))
  console.log(`   ${c('green', `http://localhost:${port}/login/lojista`)}`)
  console.log(`   Painel de controle do proprietário`)
  
  console.log(c('cyan', c('bright', '\n🔑 LOGIN DEMO:')))
  console.log(`   Email: ${c('yellow', 'admin@boteco.com')}`)
  console.log(`   Senha: ${c('yellow', '123456')}`)
  console.log(`   Loja:  ${c('yellow', 'boteco-do-joao')}`)
  
  console.log(c('white', c('bright', '\n🔧 API CONFIG:')))
  console.log(`   ${c('green', `http://localhost:${port}/api/stores/boteco-do-joao/config`)}`)
  
  console.log(c('red', c('bright', '\n📖 DOCUMENTAÇÃO:')))
  console.log(`   ${c('gray', '• README_START.md - Guia para usuários')}`)
  console.log(`   ${c('gray', '• README.md - Documentação técnica')}`)
  console.log(`   ${c('gray', '• DEPLOY_MULTI_TENANT.md - Deploy')}`)
  
  console.log(c('red', c('bright', '\n⚡ CRIAR NOVA LOJA:')))
  console.log(`   1. ${c('gray', 'cp config/stores/boteco-do-joao.json config/stores/minha-loja.json')}`)
  console.log(`   2. ${c('gray', 'Editar "slug": "minha-loja" no arquivo')}`)
  console.log(`   3. ${c('green', `http://localhost:${port}/loja/minha-loja`)}`)
  
  console.log('\n' + '='.repeat(80))
  console.log(c('green', c('bright', '✅ Sistema pronto! Acesse as URLs acima para testar')))
  console.log('='.repeat(80) + '\n')
}

// Detectar porta do Next.js
function detectPort() {
  return new Promise((resolve) => {
    const nextProcess = spawn('npx', ['next', 'dev'], {
      stdio: ['inherit', 'pipe', 'inherit']
    })

    let port = 3000
    
    nextProcess.stdout.on('data', (data) => {
      const output = data.toString()
      
      // Detectar porta alternativa
      const portMatch = output.match(/trying (\d+) instead/)
      if (portMatch) {
        port = parseInt(portMatch[1])
      }
      
      // Mostrar info quando o servidor estiver pronto
      if (output.includes('Ready in')) {
        setTimeout(() => showSystemInfo(port), 1000)
      }
      
      // Passar output do Next.js
      process.stdout.write(data)
    })

    nextProcess.on('close', (code) => {
      process.exit(code)
    })

    // Graceful shutdown
    process.on('SIGINT', () => {
      nextProcess.kill('SIGINT')
    })
  })
}

// Executar
detectPort()