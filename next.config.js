/** @type {import('next').Config} */
const nextConfig = {
  // Configuração de porta para desenvolvimento
  env: {
    PORT: '3000',
  },
  
  // Redirects para manter compatibilidade com URLs antigas
  async redirects() {
    return [
      {
        source: '/loja/:slug*',
        destination: '/store/:slug*',
        permanent: true,
      },
    ]
  },

  // Rewrites para redirecionar chamadas da API para o backend externo
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:3001/api/v1/:path*',
      },
      // Fallback para outras rotas de API se necessário
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ]
  },

  // Configurações de desenvolvimento
  experimental: {
    // Otimizações para desenvolvimento
    optimizePackageImports: ['@tanstack/react-query'],
  },

  // Configurações de build
  typescript: {
    ignoreBuildErrors: false,
  },

  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig 