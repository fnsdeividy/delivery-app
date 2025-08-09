import { filterProducts, normalizeQuery } from '../lib/menu/search'
import { Product } from '../types/store'

describe('menu search utils', () => {
  const products: Product[] = [
    { id: '1', name: 'Pizza Vegana', description: 'Massa fina com legumes', price: 49.9, image: '', category: 'cat1', ingredients: ['tomate', 'rúcula'], tags: ['vegano'], tagColor: 'green', active: true },
    { id: '2', name: 'Hambúrguer Sem Glúten', description: 'Pão especial', price: 29.9, image: '', category: 'cat2', ingredients: ['carne', 'alface'], tags: ['sem glúten'], tagColor: 'blue', active: true },
    { id: '3', name: 'Suco de Laranja', description: 'Natural', price: 9.9, image: '', category: 'cat3', ingredients: ['laranja'], tags: [], tagColor: 'orange', active: true },
  ]

  it('normaliza acentos', () => {
    expect(normalizeQuery('RÚCULA')).toBe('rucula')
  })

  it('filtra por nome, descrição, ingrediente e tag', () => {
    expect(filterProducts('vegana', products).map(p => p.id)).toEqual(['1'])
    expect(filterProducts('gluten', products).map(p => p.id)).toEqual(['2'])
    expect(filterProducts('laranja', products).map(p => p.id)).toEqual(['3'])
    expect(filterProducts('rúcula', products).map(p => p.id)).toEqual(['1'])
  })
})

