import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (session) {
      return NextResponse.json(session)
    } else {
      return NextResponse.json(null)
    }
  } catch (error) {
    console.error('Erro ao obter sessão:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
} 