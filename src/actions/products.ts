'use server'

import prisma from '@/lib/prisma'
import { ProductSchemaType } from '@/schemas/product'
import { Prisma } from '@prisma/client'
import fs from 'fs/promises'
import { revalidatePath } from 'next/cache'
import path from 'path'

export type ProductWithCategory = Prisma.ProductGetPayload<{ include: { category: true } }>

export const getProducts = async () => {
  return await prisma.product.findMany({ include: { category: true } })
}

export async function createProduct(values: ProductSchemaType) {
  const file = values.image

  let fileName

  if (file) {
    const buffer = Buffer.from(await file.arrayBuffer())
    fileName = `${Date.now()}-${file.name.replace(/\s/g, '-')}`
    const filePath = path.join(process.cwd(), 'public', 'uploads', fileName)

    await fs.mkdir(path.join(process.cwd(), 'public', 'uploads'), { recursive: true })
    await fs.writeFile(filePath, buffer)
  }
  await prisma.product.create({ data: { ...values, image: fileName } })

  revalidatePath('/dashboard/products')
}

export async function deleteProduct(id: number) {
  await prisma.product.delete({ where: { id } })
  revalidatePath('/dashboard/products')
}
