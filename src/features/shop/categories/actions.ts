'use server'

import prisma from '@/src/lib/db/prisma'
import { authAction } from '@/src/lib/safe-action'
import { CreateCategorySchema, DeleteCategorySchema, UpdateCategorySchema } from './schemas'

export const getCategories = authAction
  .metadata({ actionName: 'getCategories' })
  .action(async ({ ctx }) => {
    return await prisma.category.findMany({
      where: {
        organizationId: ctx.session.organizationId!,
      },
      orderBy: { id: 'asc' },
    })
  })

export const createCategory = authAction
  .metadata({ actionName: 'createCategory' })
  .inputSchema(CreateCategorySchema)
  .action(async ({ ctx, parsedInput }) => {
    await prisma.category.create({
      data: {
        ...parsedInput,
        organizationId: ctx.session.organizationId!,
      },
    })
  })

export const updateCategory = authAction
  .metadata({ actionName: 'updateCategory' })
  .inputSchema(UpdateCategorySchema)
  .action(async ({ ctx, parsedInput }) => {
    const { id, ...data } = parsedInput
    await prisma.category.update({
      where: { id, organizationId: ctx.session.organizationId! },
      data,
    })
  })

export const deleteCategory = authAction
  .metadata({ actionName: 'deleteCategory' })
  .inputSchema(DeleteCategorySchema)
  .action(async ({ ctx, parsedInput }) => {
    await prisma.category.delete({
      where: { id: parsedInput.id, organizationId: ctx.session.organizationId! },
    })
  })
