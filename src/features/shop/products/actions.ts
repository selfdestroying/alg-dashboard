'use server'

import { Prisma } from '@/prisma/generated/client'
import prisma from '@/src/lib/db/prisma'
import { InternalServerError } from '@/src/lib/error'
import { authAction } from '@/src/lib/safe-action'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client'
import { randomUUID } from 'crypto'
import fs from 'fs/promises'
import { revalidatePath } from 'next/cache'
import path from 'path'
import { CreateProductSchema, DeleteProductSchema, UpdateProductSchema } from './schemas'

const IMAGE_URL = process.env.IMAGE_URL ?? ''
const IMAGE_PATH = process.env.IMAGE_PATH ?? ''

export type ProductWithCategory = Prisma.ProductGetPayload<{ include: { category: true } }>

export const getProducts = authAction
  .metadata({ actionName: 'getProducts' })
  .action(async ({ ctx }) => {
    return await prisma.product.findMany({
      where: {
        organizationId: ctx.session.organizationId!,
      },
    })
  })

export const createProduct = authAction
  .metadata({ actionName: 'createProduct' })
  .inputSchema(CreateProductSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { image } = parsedInput
    const buffer = Buffer.from(await image.arrayBuffer())
    const ext = path.extname(image.name)
    const fileName = `${randomUUID()}${ext}`
    const filePath = path.join(IMAGE_PATH, fileName)
    const fileUrl = new URL(fileName, IMAGE_URL)

    await fs.writeFile(filePath, buffer)

    await prisma.product.create({
      data: {
        ...parsedInput,
        imageUrl: fileUrl.href,
        organizationId: ctx.session.organizationId!,
      },
    })

    revalidatePath('/products')
  })

export const updateProduct = authAction
  .metadata({ actionName: 'updateProduct' })
  .inputSchema(UpdateProductSchema)
  .action(async ({ ctx, parsedInput }) => {
    try {
      const { id, image, ...data } = parsedInput
      let imageUrl: string | undefined

      if (image) {
        const buffer = Buffer.from(await image.arrayBuffer())
        const ext = path.extname(image.name)
        const fileName = `${randomUUID()}${ext}`
        const filePath = path.join(IMAGE_PATH, fileName)
        const fileUrl = new URL(fileName, IMAGE_URL)
        imageUrl = fileUrl.href
        await fs.writeFile(filePath, buffer)
      }

      await prisma.product.update({
        where: {
          organizationId: ctx.session.organizationId!,
          id,
        },
        data: {
          ...data,
          imageUrl,
        },
      })
      revalidatePath('/products')
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        throw new InternalServerError(e.message)
      }
    }
  })

export const deleteProduct = authAction
  .metadata({ actionName: 'deleteProduct' })
  .inputSchema(DeleteProductSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { id } = parsedInput
    await prisma.product.delete({ where: { id, organizationId: ctx.session.organizationId! } })
    revalidatePath('/products')
  })
