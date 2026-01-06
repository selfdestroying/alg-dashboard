'use server'

import prisma from '@/lib/prisma'
import { ProductSchemaType } from '@/schemas/product'
import { Prisma } from '@prisma/client'
import { randomUUID } from 'crypto'
import fs from 'fs/promises'
import { revalidatePath } from 'next/cache'
import path from 'path'

export type ProductWithCategory = Prisma.ProductGetPayload<{ include: { category: true } }>

export const getProducts = async () => {
  return await prisma.product.findMany({ include: { category: true } })
}

export async function createProduct(values: ProductSchemaType) {
  const file = values.image

  if (!file) {
    throw new Error('Image is required')
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const ext = path.extname(file.name)
  const fileName = `${Date.now()}-${randomUUID().slice(0, 8)}${ext}`
  const filePath = path.join('/var/www/storage/images', fileName)
  const fileUrl = `http://images.alg.tw1.ru/images/${fileName}`

  await fs.writeFile(filePath, buffer)
  await prisma.product.create({ data: { ...values, image: fileUrl } })

  revalidatePath('/dashboard/products')
}

export async function updateproduct({ where, data }: Prisma.ProductUpdateArgs) {
  await prisma.product.update({ where, data })
  revalidatePath('/dashboard/products')
}

export async function deleteProduct(id: number) {
  await prisma.product.delete({ where: { id } })
  revalidatePath('/dashboard/products')
}
