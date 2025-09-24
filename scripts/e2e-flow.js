/* eslint-disable no-console */
const axios = require('axios');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const apiBase = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const storeSlug = process.env.STORE_SLUG || 'loja-teste-ai';

  console.log('API_URL:', apiBase);

  const client = axios.create({
    baseURL: `${apiBase}/api/v1`,
    headers: { 'Content-Type': 'application/json' },
    validateStatus: () => true,
  });

  // 0) Aguardar backend ficar pronto (health pode requerer auth; tentamos root)
  for (let i = 0; i < 10; i += 1) {
    try {
      await client.get('/health');
      console.log('Backend aparentemente acessível.');
      break;
    } catch (err) {
      console.log('Aguardando backend subir...', err.message);
      await sleep(1000);
    }
  }

  // 1) Registrar admin (idempotente: se já existir, fazemos login)
  const admin = {
    name: 'Admin Teste',
    email: 'admin.teste@example.com',
    password: 'admin123',
    role: 'ADMIN',
  };

  let token;
  let user;
  console.log('\n== Auth: register ==');
  let res = await client.post('/auth/register', admin);
  if (res.status === 201 || res.status === 200) {
    token = res.data.access_token;
    user = res.data.user;
    console.log('Registro OK ->', user.email);
  } else {
    console.log('Registro falhou/possivelmente já existe, tentando login... status:', res.status, res.data);
    res = await client.post('/auth/login', { email: admin.email, password: admin.password });
    if (res.status !== 201 && res.status !== 200) {
      throw new Error(`Login falhou: ${res.status} ${JSON.stringify(res.data)}`);
    }
    token = res.data.access_token;
    user = res.data.user;
    console.log('Login OK ->', user.email);
  }

  const authClient = axios.create({
    baseURL: `${apiBase}/api/v1`,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    validateStatus: () => true,
  });

  // 2) Criar loja (idempotente: se slug existir, só prosseguir)
  console.log('\n== Stores: create ==');
  res = await authClient.post('/stores', {
    name: 'Loja Teste AI',
    slug: storeSlug,
    description: 'Loja criada para testes e2e',
  });
  if (res.status === 201 || res.status === 200) {
    console.log('Loja criada:', res.data.slug);
  } else if (res.status === 409 || (res.data && String(res.data.message).includes('já'))) {
    console.log('Loja já existe, prosseguindo:', storeSlug);
  } else {
    console.log('Falha ao criar loja:', res.status, res.data);
  }

  // 3) Criar categoria
  console.log('\n== Categories: create ==');
  res = await authClient.post('/categories', {
    name: 'Lanches Teste',
    description: 'Categoria teste',
    active: true,
    storeSlug,
  });
  let categoryId;
  if (res.status === 201 || res.status === 200) {
    categoryId = res.data.id;
    console.log('Categoria criada:', categoryId);
  } else if (res.status === 409) {
    console.log('Categoria já existe, buscando lista para obter id...');
  } else {
    console.log('Falha ao criar categoria:', res.status, res.data);
  }
  if (!categoryId) {
    const list = await authClient.get(`/categories/store/${storeSlug}`);
    if (list.status === 200 && Array.isArray(list.data) && list.data.length > 0) {
      const found = list.data.find(c => c.name === 'Lanches Teste') || list.data[0];
      categoryId = found?.id;
      console.log('Categoria obtida:', categoryId, found?.name);
    } else {
      throw new Error(`Não foi possível obter categorias: ${list.status} ${JSON.stringify(list.data)}`);
    }
  }

  // 4) Criar produto
  console.log('\n== Products: create ==');
  res = await authClient.post(`/products`, {
    name: 'X-Burger Teste',
    description: 'Hambúrguer teste',
    price: 25.9,
    categoryId,
    active: true,
  }, { params: { storeSlug } });
  if (res.status === 201 || res.status === 200) {
    console.log('Produto criado:', res.data.id, res.data.name);
  } else {
    console.log('Falha ao criar produto:', res.status, res.data);
  }

  // 5) Listar produtos para conferir
  console.log('\n== Products: list ==');
  const listRes = await authClient.get(`/products`, { params: { storeSlug } });
  if (listRes.status === 200) {
    const items = Array.isArray(listRes.data) ? listRes.data : (listRes.data?.items || []);
    console.log('Total produtos (amostra até 3):', items.length, items.slice(0, 3).map(p => ({ id: p.id, name: p.name })));
  } else {
    console.log('Falha ao listar produtos:', listRes.status, listRes.data);
  }

  console.log('\nFluxo concluído.');
}

main().catch(err => {
  console.error('Erro no fluxo:', err?.response?.status, err?.response?.data || err.message);
  process.exit(1);
});

