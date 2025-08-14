import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import ClientProvider from '../components/ClientProvider'
import { QueryProvider } from '../components/QueryProvider'
import SessionProvider from '../components/SessionProvider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Cardap.IO - Sistema Multi-Tenant de Delivery',
  description: 'Plataforma completa para lojistas e clientes com dashboard administrativo e sistema de pedidos',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <QueryProvider>
          <SessionProvider>
            <ClientProvider>
              {children}
            </ClientProvider>
          </SessionProvider>
        </QueryProvider>
      </body>
    </html>
  )
} 