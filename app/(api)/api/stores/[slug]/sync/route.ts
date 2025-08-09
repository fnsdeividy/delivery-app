import { writeFile } from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import { join } from 'path'
import { db } from '../../../../../../lib/db'

/**
 * API para sincronizar configurações do dashboard com o banco de dados
 * POST /api/stores/[slug]/sync - Sincronizar configurações
 */

const STORES_CONFIG_PATH = join(process.cwd(), 'config', 'stores')

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Slug da loja é obrigatório' },
        { status: 400 }
      )
    }

    const updates = await request.json()
    
    // 1. Atualizar configurações no banco de dados
    const updatedStore = await db.store.update({
      where: { slug },
      data: {
        config: updates
      },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        active: true,
        config: true,
        updatedAt: true
      }
    })

    // 2. Salvar também no arquivo JSON (para compatibilidade)
    try {
      const configPath = join(STORES_CONFIG_PATH, `${slug}.json`)
      await writeFile(configPath, JSON.stringify(updates, null, 2), 'utf-8')
    } catch (fileError) {
      console.warn('Erro ao salvar arquivo JSON, mas configuração foi salva no banco:', fileError)
    }

    return NextResponse.json({
      message: 'Configurações sincronizadas com sucesso',
      store: updatedStore
    })

  } catch (error) {
    console.error('Erro ao sincronizar configurações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 