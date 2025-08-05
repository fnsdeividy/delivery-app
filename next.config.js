/** @type {import('next').NextConfig} */
const nextConfig = {
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