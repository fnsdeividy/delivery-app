/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["@tanstack/react-query"],
  },

  // Configuração de porta para desenvolvimento
  env: {
    PORT: "3000",
  },

  // Configurações de headers para cookies
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  // Redirects para manter compatibilidade com URLs antigas
  async redirects() {
    return [
      {
        source: "/loja/:slug*",
        destination: "/store/:slug*",
        permanent: true,
      },
    ];
  },

  // Rewrites para redirecionar chamadas da API para o backend externo
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://localhost:3001/api/v1/:path*",
      },
      // Proxy para uploads - redireciona para o backend
      {
        source: "/uploads/:path*",
        destination: "http://localhost:3001/uploads/:path*",
      },
    ];
  },

  // Configurações de imagens
  images: {
    domains: ["localhost"],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/uploads/**",
      },
    ],
  },

  // Configurações de build
  typescript: {
    ignoreBuildErrors: false,
  },

  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
