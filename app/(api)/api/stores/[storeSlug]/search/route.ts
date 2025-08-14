import { NextRequest, NextResponse } from 'next/server'
import { apiClient } from '../../../../../../lib/api-client'

/**
 * API para busca de produtos na loja
 * GET /api/stores/[slug]/search - Buscar produtos por termo
 */

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const { searchParams } = new URL(request.url)
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Slug da loja é obrigatório' },
        { status: 400 }
      )
    }

    const query = searchParams.get('q')
    const category = searchParams.get('category')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const inStock = searchParams.get('inStock')

    if (!query) {
      return NextResponse.json(
        { error: 'Termo de busca é obrigatório' },
        { status: 400 }
      )
    }

    // Construir parâmetros de busca
    const searchParamsObj: any = {
      q: query,
      limit: 50
    }

    if (category) searchParamsObj.category = category
    if (minPrice) searchParamsObj.minPrice = minPrice
    if (maxPrice) searchParamsObj.maxPrice = maxPrice
    if (inStock) searchParamsObj.inStock = inStock === 'true'

    // Buscar produtos via API Cardap.IO
    const response = await apiClient.get(`/stores/${slug}/products/search`, {
      params: searchParamsObj
    })
    
    // A resposta da API não tem estrutura ApiResponse, é direta
    const products = response as any[] || []

    return NextResponse.json({
      query,
      results: products,
      total: products.length,
      filters: {
        category,
        minPrice: minPrice ? Number(minPrice) : null,
        maxPrice: maxPrice ? Number(maxPrice) : null,
        inStock: inStock === 'true'
      }
    })

  } catch (error: any) {
    console.error('Erro na busca de produtos:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

