import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const storeConfig = await request.json()
    const { slug } = storeConfig

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug é obrigatório' },
        { status: 400 }
      )
    }

    // Caminho do arquivo
    const configDir = path.join(process.cwd(), 'config', 'stores')
    const filePath = path.join(configDir, `${slug}.json`)

    // Verificar se arquivo já existe
    if (existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Já existe uma loja com este slug' },
        { status: 409 }
      )
    }

    // Criar diretório se não existir
    if (!existsSync(configDir)) {
      await mkdir(configDir, { recursive: true })
    }

    // Salvar arquivo JSON
    await writeFile(filePath, JSON.stringify(storeConfig, null, 2), 'utf8')

    return NextResponse.json(
      { message: 'Loja criada com sucesso', slug },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao criar loja:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}