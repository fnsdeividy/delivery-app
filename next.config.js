/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["@tanstack/react-query"],
  },

  env: {
    PORT: "3000",
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
        ],
      },
    ];
  },

  async redirects() {
    return [
      {
        source: "/loja/:slug*",
        destination: "/store/:slug*",
        permanent: true,
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://localhost:3001/api/v1/:path*",
      },
      {
        source: "/uploads/:path*",
        destination: "http://localhost:3001/uploads/:path*",
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "**", // qualquer domínio http
      },
      {
        protocol: "https",
        hostname: "**", // qualquer domínio https
      },
    ],
  },

  typescript: {
    ignoreBuildErrors: false,
  },

  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
