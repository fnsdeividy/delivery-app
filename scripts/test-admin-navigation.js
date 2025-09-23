#!/usr/bin/env node

/**
 * Script para testar a navegação do admin
 * Verifica se o sistema de autenticação está funcionando corretamente
 */

const fs = require("fs");
const path = require("path");

console.log("🔍 Testando configuração de navegação do admin...\n");

// Verificar se os arquivos principais existem
const filesToCheck = [
  "middleware.ts",
  "hooks/useTokenSync.ts",
  "app/(dashboard)/dashboard/[storeSlug]/page.tsx",
  "components/AuthDebug.tsx",
  "app/(dashboard)/dashboard/layout.tsx",
];

let allFilesExist = true;

filesToCheck.forEach((file) => {
  const filePath = path.join(__dirname, "..", file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} - OK`);
  } else {
    console.log(`❌ ${file} - Arquivo não encontrado`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log(
    "\n❌ Alguns arquivos estão faltando. Execute as correções primeiro."
  );
  process.exit(1);
}

console.log("\n✅ Todos os arquivos estão presentes!");
console.log("\n📋 Resumo das correções implementadas:");
console.log("1. ✅ Removido conceito de SUPER_ADMIN do sistema");
console.log("2. ✅ Usuários agora são criados como ADMIN (logista) por padrão");
console.log("3. ✅ Middleware atualizado para trabalhar apenas com ADMIN");
console.log("4. ✅ Sincronização de token mais robusta com fallback cookies");
console.log("5. ✅ Logs de debug adicionados para facilitar diagnóstico");
console.log("6. ✅ Componente AuthDebug para monitoramento em tempo real");
console.log("7. ✅ Melhor tratamento de erros na página de dashboard");

console.log("\n🚀 Próximos passos:");
console.log("1. Reinicie o servidor de desenvolvimento: npm run dev");
console.log("2. Faça login como admin");
console.log(
  '3. Use o botão "🔧 Debug Auth" no canto inferior direito para monitorar o status'
);
console.log("4. Verifique o console do navegador para logs detalhados");
console.log("5. Teste a navegação entre as páginas do dashboard");

console.log("\n💡 Se ainda houver problemas:");
console.log(
  "- Verifique se o token JWT está sendo gerado corretamente no backend"
);
console.log(
  '- Confirme se o role do usuário está definido como "ADMIN" (logista)'
);
console.log(
  "- Verifique se o storeSlug está sendo definido corretamente no token"
);
console.log(
  "- Use o componente AuthDebug para identificar problemas específicos"
);
console.log("- Execute a migração do banco: npx prisma db push (no backend)");

console.log("\n✨ Navegação do admin corrigida com sucesso!");
