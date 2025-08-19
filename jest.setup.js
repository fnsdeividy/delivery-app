// Configuração do Jest para testes
require('@testing-library/jest-dom')

// Polyfill para fetch no Jest (usando implementação nativa do Node 18+)
if (typeof global.fetch === 'undefined') {
  global.fetch = globalThis.fetch || (() => {
    throw new Error('fetch não está disponível no ambiente de teste')
  })
}

// Mock do NextAuth
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  signOut: jest.fn(),
  useSession: jest.fn(),
  getSession: jest.fn(),
  getProviders: jest.fn(),
  getCsrfToken: jest.fn(),
  SessionProvider: ({ children }) => children,
}))

// Mock do Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

// Mock do bcrypt (removido - não necessário para testes atuais)

// Configurar variáveis de ambiente para testes
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.NEXTAUTH_URL = 'http://localhost:3001'

// Mock do React Query DevTools
jest.mock('@tanstack/react-query-devtools', () => ({
  ReactQueryDevtools: () => null,
}))

// Mock do window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
}) 