import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import ClientProvider from '../components/ClientProvider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Delivery App - Entregas Rápidas e Seguras',
  description: 'Plataforma de delivery moderna com interface intuitiva e entregas rápidas',
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