/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração de porta para evitar conflito com o backend
  env: {
    PORT: '3001',
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
}

module.exports = nextConfig 