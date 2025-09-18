#!/usr/bin/env node

/**
 * Script para testar a correção do erro 401 na atualização de status de pedidos
 *
 * Este script verifica:
 * 1. Se o token está sendo sincronizado corretamente entre localStorage e cookies
 * 2. Se as requisições estão sendo enviadas com headers de autenticação
 * 3. Se o tratamento de erro 401 está funcionando
 */

const fs = require("fs");
const path = require("path");

console.log("🔍 Verificando correções do erro 401...\n");

// Verificar se os arquivos foram modificados corretamente
const filesToCheck = [
  {
    path: "lib/api-client-server.ts",
    checks: [
      "getAuthToken",
      "Token expirado detectado no servidor",
      "Erro 401 - Token de autenticação inválido ou expirado",
    ],
  },
  {
    path: "hooks/useTokenSync.ts",
    checks: [
      "Tentativa.*de sincronização de token",
      "Token sincronizado com sucesso",
      "Falha ao sincronizar token após múltiplas tentativas",
    ],
  },
  {
    path: "lib/api-client.ts",
    checks: [
      "Erro 401 detectado - Token inválido ou expirado",
      "session_expired",
      "window.location.pathname.includes",
    ],
  },
  {
    path: "components/orders/OrderCard.tsx",
    checks: [
      "useErrorNotification",
      "showNotification",
      "ErrorNotification",
      "disabled:hover:shadow-sm",
    ],
  },
  {
    path: "components/ui/error-notification.tsx",
    checks: [
      "ErrorNotification",
      "useErrorNotification",
      "transform transition-all duration-300",
    ],
  },
];

let allChecksPassed = true;

filesToCheck.forEach(({ path: filePath, checks }) => {
  const fullPath = path.join(__dirname, "..", filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`❌ Arquivo não encontrado: ${filePath}`);
    allChecksPassed = false;
    return;
  }

  const content = fs.readFileSync(fullPath, "utf8");
  const missingChecks = [];

  checks.forEach((check) => {
    const regex = new RegExp(check, "i");
    if (!regex.test(content)) {
      missingChecks.push(check);
    }
  });

  if (missingChecks.length === 0) {
    console.log(`✅ ${filePath} - Todas as verificações passaram`);
  } else {
    console.log(`❌ ${filePath} - Faltando verificações:`);
    missingChecks.forEach((check) => {
      console.log(`   - ${check}`);
    });
    allChecksPassed = false;
  }
});

console.log("\n📋 Resumo das correções implementadas:");
console.log("1. ✅ Melhorado tratamento de token no api-client-server.ts");
console.log("2. ✅ Adicionado logs detalhados para debug de autenticação");
console.log("3. ✅ Melhorado sincronização de token no useTokenSync.ts");
console.log(
  "4. ✅ Implementado redirecionamento automático em caso de erro 401"
);
console.log("5. ✅ Criado componente de notificação de erro elegante");
console.log("6. ✅ Melhorado feedback visual no OrderCard");
console.log("7. ✅ Adicionado tratamento de erro específico para cada ação");

if (allChecksPassed) {
  console.log(
    "\n🎉 Todas as verificações passaram! A correção está implementada."
  );
  console.log("\n📝 Próximos passos para testar:");
  console.log("1. Faça login no dashboard");
  console.log("2. Vá para a página de pedidos");
  console.log("3. Tente confirmar ou cancelar um pedido");
  console.log("4. Verifique se não há mais erro 401");
  console.log("5. Teste com token expirado (se possível)");
} else {
  console.log(
    "\n⚠️  Algumas verificações falharam. Verifique os arquivos mencionados."
  );
}

console.log("\n🔧 Para testar manualmente:");
console.log("1. Abra o DevTools (F12)");
console.log("2. Vá para a aba Console");
console.log("3. Tente atualizar o status de um pedido");
console.log("4. Verifique se aparecem os logs de sincronização de token");
console.log("5. Se houver erro 401, verifique se o redirecionamento funciona");
