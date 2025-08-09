import { Product } from '../../types/store'

export function normalizeQuery(value: string): string {
  // Remove diacríticos (acentos) usando intervalo de combining marks
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export function filterProducts(query: string, products: Product[]): Product[] {
  const q = normalizeQuery(query)
  if (!q) return products

  return products.filter(product => {
    const haystack = [
      product.name,
      product.description,
      ...product.ingredients,
      ...(product.tags || []),
    ]
      .join(' ')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()

    return haystack.includes(q)
  })
}

