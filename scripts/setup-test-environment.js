#!/usr/bin/env node

/**
 * Script para configurar ambiente de teste
 * 
 * Este script:
 * 1. Executa a seed de dados de teste
 * 2. Verifica se os serviços estão rodando
 * 3. Prepara o ambiente para testes E2E
 */

const { exec, spawn } = require('child_process');
const axios = require('axios');
const path = require('path');

const config = {
  backend: {
    url: 'http://localhost:3000',
    healthEndpoint: '/health',
  },
  frontend: {
    url: 'http://localhost:3001',
  },
  seedScript: '../delivery-back/prisma/seed-test-data.ts',
};

class TestEnvironmentSetup {
  constructor() {
    this.services = {
      backend: false,
      frontend: false,
      database: false,
    };
  }

  async checkService(name, url, timeout = 5000) {
    console.log(`🔍 Verificando ${name}...`);

    try {
      const response = await axios.get(url, { timeout });
      console.log(`✅ ${name} está rodando (${response.status})`);
      return true;
    } catch (error) {
      console.log(`❌ ${name} não está acessível: ${error.message}`);
      return false;
    }
  }

  async checkBackend() {
    const healthUrl = `${config.backend.url}${config.backend.healthEndpoint}`;
    this.services.backend = await this.checkService('Backend', healthUrl);

    if (!this.services.backend) {
      // Tentar endpoint alternativo
      this.services.backend = await this.checkService('Backend', config.backend.url);
    }

    return this.services.backend;
  }

  async checkFrontend() {
    this.services.frontend = await this.checkService('Frontend', config.frontend.url);
    return this.services.frontend;
  }

  async checkDatabase() {
    console.log('🔍 Verificando banco de dados...');

    try {
      // Tentar conectar via endpoint do backend
      const response = await axios.get(`${config.backend.url}/stores`, { timeout: 5000 });
      console.log('✅ Banco de dados está acessível');
      this.services.database = true;
      return true;
    } catch (error) {
      console.log(`❌ Banco de dados não está acessível: ${error.message}`);
      this.services.database = false;
      return false;
    }
  }

  async runSeed() {
    console.log('\n🌱 Executando seed de dados de teste...');

    const seedPath = path.resolve(__dirname, config.seedScript);

    return new Promise((resolve, reject) => {
      const seedProcess = spawn('npx', ['ts-node', seedPath], {
        cwd: path.resolve(__dirname, '../delivery-back'),
        stdio: 'inherit',
      });

      seedProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Seed executado com sucesso!');
          resolve(true);
        } else {
          console.log(`❌ Seed falhou com código: ${code}`);
          resolve(false);
        }
      });

      seedProcess.on('error', (error) => {
        console.log(`❌ Erro ao executar seed: ${error.message}`);
        resolve(false);
      });
    });
  }

  async validateTestData() {
    console.log('\n🧪 Validando dados de teste...');

    const testStores = [
      'pizzaria-do-mario',
      'burguer-house',
      'sushi-yamato',
      'doceria-da-vovo',
    ];

    let validStores = 0;

    for (const storeSlug of testStores) {
      try {
        const storeUrl = `${config.backend.url}/stores/${storeSlug}`;
        const response = await axios.get(storeUrl, { timeout: 5000 });

        if (response.data && response.data.slug === storeSlug) {
          console.log(`✅ Loja ${storeSlug} encontrada`);
          validStores++;
        } else {
          console.log(`❌ Loja ${storeSlug} inválida`);
        }
      } catch (error) {
        console.log(`❌ Erro ao verificar loja ${storeSlug}: ${error.message}`);
      }
    }

    console.log(`📊 ${validStores}/${testStores.length} lojas válidas`);
    return validStores === testStores.length;
  }

  async startServices() {
    console.log('\n🚀 Verificando se é necessário iniciar serviços...');

    const instructions = [];

    if (!this.services.backend) {
      instructions.push('Backend: cd delivery-back && npm run start:dev');
    }

    if (!this.services.frontend) {
      instructions.push('Frontend: cd delivery-app && npm run dev');
    }

    if (instructions.length > 0) {
      console.log('\n📋 Para iniciar os serviços necessários, execute:');
      instructions.forEach((instruction, index) => {
        console.log(`   ${index + 1}. ${instruction}`);
      });
      console.log('\nApós iniciar os serviços, execute este script novamente.\n');
      return false;
    }

    return true;
  }

  async setup() {
    console.log('🔧 Configurando ambiente de teste...\n');

    // Verificar serviços
    await this.checkBackend();
    await this.checkFrontend();
    await this.checkDatabase();

    // Verificar se todos os serviços estão rodando
    const allServicesRunning = Object.values(this.services).every(status => status);

    if (!allServicesRunning) {
      console.log('\n❌ Nem todos os serviços estão rodando');
      await this.startServices();
      return false;
    }

    console.log('\n✅ Todos os serviços estão rodando');

    // Executar seed
    const seedSuccess = await this.runSeed();
    if (!seedSuccess) {
      console.log('\n❌ Falha ao executar seed - continuando mesmo assim...');
    }

    // Validar dados de teste
    const dataValid = await this.validateTestData();
    if (!dataValid) {
      console.log('\n⚠️ Alguns dados de teste podem estar inválidos');
    }

    console.log('\n🎉 Ambiente de teste configurado!');
    console.log('\nPara executar os testes E2E:');
    console.log('   npm run test:e2e:buyer');
    console.log('\nOu diretamente:');
    console.log('   node tests/e2e/buyer-experience.test.js');

    return true;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const setup = new TestEnvironmentSetup();
  setup.setup().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Erro no setup:', error);
    process.exit(1);
  });
}

module.exports = TestEnvironmentSetup;
