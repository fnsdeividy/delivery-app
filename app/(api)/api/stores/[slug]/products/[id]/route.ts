import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../../../lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string; id: string } }
) {
  try {
    const { slug, id } = params
    const body = await request.json()
    
    const {
      name,
      description,
      price,
      categoryId,
      image,
      active,
      stock,
      minStock,
      tags = [],
      tagColor = '#ed7516',
      preparationTime,
      nutritionalInfo
    } = body

    // Validações
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }
    
    if (!price || typeof price !== 'number' || price <= 0) {
      return NextResponse.json({ error: 'Preço deve ser um número positivo' }, { status: 400 })
    }

    if (!categoryId || typeof categoryId !== 'string') {
      return NextResponse.json({ error: 'Categoria é obrigatória' }, { status: 400 })
    }

    // Verificar se a loja existe
    const store = await db.store.findUnique({ where: { slug } })
    if (!store) {
      return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 })
    }

    // Verificar se o produto existe
    const existingProduct = await db.product.findFirst({
      where: { id, storeSlug: slug }
    })
    
    if (!existingProduct) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    // Verificar se a categoria existe
    const category = await db.category.findFirst({
      where: { id: categoryId, storeSlug: slug }
    })
    
    if (!category) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 })
    }

    // Atualizar o produto
    const updatedProduct = await db.product.update({
      where: { id },
      data: {
        name,
        description: description || '',
        price,
        categoryId,
        image: image || '',
        active: !!active,
        tags,
        tagColor,
        preparationTime: preparationTime || null,
        nutritionalInfo: nutritionalInfo || null,
        updatedAt: new Date()
      },
      include: {
        category: true,
        inventory: true
      }
    })

    // Atualizar ou criar estoque
    if (stock !== undefined || minStock !== undefined) {
      const currentStock = await db.inventory.findUnique({
        where: { productId: id }
      })

      if (currentStock) {
        // Atualizar estoque existente
        await db.inventory.update({
          where: { productId: id },
          data: {
            quantity: stock !== undefined ? stock : currentStock.quantity,
            minStock: minStock !== undefined ? minStock : currentStock.minStock
          }
        })
      } else {
        // Criar novo estoque
        await db.inventory.create({
          data: {
            productId: id,
            quantity: stock || 0,
            minStock: minStock || 0
          }
        })
      }
    }

    // Buscar o produto atualizado com estoque
    const finalProduct = await db.product.findUnique({
      where: { id },
      include: {
        category: true,
        inventory: true
      }
    })

    return NextResponse.json({
      message: 'Produto atualizado com sucesso!',
      product: finalProduct
    })

  } catch (error) {
    console.error('Erro ao atualizar produto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string; id: string } }
) {
  try {
    const { slug, id } = params

    // Verificar se a loja existe
    const store = await db.store.findUnique({ where: { slug } })
    if (!store) {
      return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 })
    }

    // Verificar se o produto existe
    const existingProduct = await db.product.findFirst({
      where: { id, storeSlug: slug }
    })
    
    if (!existingProduct) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    // Deletar estoque primeiro (se existir)
    await db.inventory.deleteMany({
      where: { productId: id }
    })

    // Deletar ingredientes e addons
    await db.productIngredient.deleteMany({
      where: { productId: id }
    })

    await db.productAddon.deleteMany({
      where: { productId: id }
    })

    // Deletar o produto
    await db.product.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Produto excluído com sucesso!'
    })

  } catch (error) {
    console.error('Erro ao excluir produto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 