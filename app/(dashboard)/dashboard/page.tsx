import { redirect } from 'next/navigation'

export default function DashboardAdmin() {
  // Redirecionamento automático para a nova Dashboard principal
  redirect('/dashboard/gerenciar-lojas')
} 