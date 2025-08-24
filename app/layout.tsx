import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import ClientProvider from '../components/ClientProvider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Cardap.IO - Sistema de Delivery',
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
        <ClientProvider>
          {children}
        </ClientProvider>
      </body>
    </html>
  )
} 