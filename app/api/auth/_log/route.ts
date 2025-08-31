import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // Em desenvolvimento, apenas logar e retornar sucesso
    const body = await request.json()
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 })
  }
} 