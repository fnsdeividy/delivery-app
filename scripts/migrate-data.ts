/**
 * Script de Migração - JSON para Banco de Dados
 * Migra dados dos arquivos JSON para PostgreSQL via Prisma
 */

import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { readFile } from 'fs/promises'
import { join } from 'path'

const db = new PrismaClient()

interface JsonUser {
  id: string
  email: string
  password: string
  name: string
  role: string
  storeSlug?: string
  active: boolean
  createdAt: string
  permissions?: string[]
}

interface JsonStore {
  slug: string
  name: string
  description?: string
  branding?: any
  business?: any
  menu?: any
  delivery?: any
  payments?: any
  schedule?: any
  promotions?: any
  settings?: any
}

async function migrateUsers() {
  console.log('🔄 Migrando usuários...')
  
  try {
    const usersPath = join(process.cwd(), 'data', 'users.json')
    const usersData = await readFile(usersPath, 'utf-8')
    const users: JsonUser[] = JSON.parse(usersData)

    for (const user of users) {
      // Mapear roles para enum
      let role: UserRole
      switch (user.role) {
        case 'super_admin':
          role = UserRole.SUPER_ADMIN
          break
        case 'admin':
          role = UserRole.ADMIN
          break
        case 'cliente':
          role = UserRole.CLIENTE
          break
        default:
          role = UserRole.CLIENTE
      }

      const existingUser = await db.user.findUnique({
        where: { email: user.email }
      })

      if (existingUser) {
        console.log(`⚠️  Usuário ${user.email} já existe, pulando...`)
        continue
      }

      await db.user.create({
        data: {
          id: user.id,
          email: user.email,
          password: user.password, // Já está hasheado no JSON
          name: user.name,
          role: role,
          storeSlug: user.storeSlug || null,
          active: user.active,
          createdAt: new Date(user.createdAt)
        }
      })

      console.log(`✅ Usuário ${user.email} migrado com sucesso`)
    }

    console.log('✅ Migração de usuários concluída!')
  } catch (error) {
    console.error('❌ Erro na migração de usuários:', error)
    throw error
  }
}

async function migrateStores() {
  console.log('🔄 Migrando lojas...')
  
  try {
    // Migrar loja do exemplo (boteco-do-joao)
    const storeConfigPath = join(process.cwd(), 'config', 'stores', 'boteco-do-joao.json')
    const storeData = await readFile(storeConfigPath, 'utf-8')
    const storeConfig: JsonStore = JSON.parse(storeData)

    const existingStore = await db.store.findUnique({
      where: { slug: storeConfig.slug }
    })

    if (existingStore) {
      console.log(`⚠️  Loja ${storeConfig.slug} já existe, atualizando configuração...`)
      
      await db.store.update({
        where: { slug: storeConfig.slug },
        data: {
          name: storeConfig.name,
          description: storeConfig.description || '',
          config: storeConfig as any
        }
      })
    } else {
      await db.store.create({
        data: {
          slug: storeConfig.slug,
          name: storeConfig.name,
          description: storeConfig.description || '',
          config: storeConfig as any,
          active: true
        }
      })
    }

    console.log(`✅ Loja ${storeConfig.slug} migrada com sucesso`)
    console.log('✅ Migração de lojas concluída!')
  } catch (error) {
    console.error('❌ Erro na migração de lojas:', error)
    throw error
  }
}

async function migrateProducts() {
  console.log('🔄 Migrando produtos do boteco-do-joao...')
  
  try {
    const storeSlug = 'boteco-do-joao'
    const storeConfigPath = join(process.cwd(), 'config', 'stores', `${storeSlug}.json`)
    const storeData = await readFile(storeConfigPath, 'utf-8')
    const storeConfig = JSON.parse(storeData)

    if (!storeConfig.menu || !storeConfig.menu.products) {
      console.log('⚠️  Nenhum produto encontrado na configuração da loja')
      return
    }

    // Primeiro, criar categorias
    const categories = storeConfig.menu.categories || []
    for (const category of categories) {
      const existingCategory = await db.category.findFirst({
        where: { 
          storeSlug: storeSlug,
          name: category.name 
        }
      })

      if (!existingCategory) {
        await db.category.create({
          data: {
            id: category.id,
            name: category.name,
            description: category.description,
            order: category.order || 0,
            active: category.active !== false,
            image: category.image,
            storeSlug: storeSlug
          }
        })
        console.log(`✅ Categoria ${category.name} criada`)
      }
    }

    // Depois, criar produtos
    const products = storeConfig.menu.products || []
    for (const product of products) {
      const existingProduct = await db.product.findFirst({
        where: { 
          storeSlug: storeSlug,
          name: product.name 
        }
      })

      if (existingProduct) {
        console.log(`⚠️  Produto ${product.name} já existe, pulando...`)
        continue
      }

      const createdProduct = await db.product.create({
        data: {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.image,
          active: product.active !== false,
          preparationTime: product.preparationTime,
          categoryId: product.category, // Assumindo que category é o ID
          storeSlug: storeSlug,
          nutritionalInfo: product.nutritionalInfo || null,
          tags: product.tags || [],
          tagColor: product.tagColor || '#ed7516'
        }
      })

      // Criar ingredientes
      if (product.customizeIngredients) {
        for (const ingredient of product.customizeIngredients) {
          await db.productIngredient.create({
            data: {
              id: ingredient.id,
              name: ingredient.name,
              included: ingredient.included !== false,
              removable: ingredient.removable !== false,
              productId: createdProduct.id
            }
          })
        }
      }

      // Criar adicionais
      if (product.addons) {
        for (const addon of product.addons) {
          await db.productAddon.create({
            data: {
              id: addon.id,
              name: addon.name,
              price: addon.price,
              category: addon.category,
              maxQuantity: addon.maxQuantity,
              active: addon.selected !== false,
              productId: createdProduct.id
            }
          })
        }
      }

      // Criar registro de estoque inicial
      await db.inventory.create({
        data: {
          productId: createdProduct.id,
          quantity: 100, // Estoque inicial padrão
          minStock: 5,
          storeSlug: storeSlug
        }
      })

      console.log(`✅ Produto ${product.name} migrado com estoque inicial`)
    }

    console.log('✅ Migração de produtos concluída!')
  } catch (error) {
    console.error('❌ Erro na migração de produtos:', error)
    throw error
  }
}

async function createDefaultSuperAdmin() {
  console.log('🔄 Criando super admin padrão...')
  
  try {
    const existingAdmin = await db.user.findUnique({
      where: { email: 'superadmin@cardap.io' }
    })

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 12)
      
      await db.user.create({
        data: {
          email: 'superadmin@cardap.io',
          password: hashedPassword,
          name: 'Super Admin',
          role: UserRole.SUPER_ADMIN,
          active: true
        }
      })
      
      console.log('✅ Super admin criado: superadmin@cardap.io / admin123')
    } else {
      console.log('⚠️  Super admin já existe')
    }
  } catch (error) {
    console.error('❌ Erro ao criar super admin:', error)
    throw error
  }
}

async function main() {
  console.log('🚀 Iniciando migração dos dados...')
  
  try {
    await migrateStores()
    await migrateUsers()
    await migrateProducts()
    await createDefaultSuperAdmin()
    
    console.log('🎉 Migração concluída com sucesso!')
  } catch (error) {
    console.error('💥 Erro na migração:', error)
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

// Execute if this file is run directly
main()

export { createDefaultSuperAdmin, migrateProducts, migrateStores, migrateUsers }
