'use server'

import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export const getCategories = async <T extends Prisma.CategoryFindManyArgs>(
  payload?: Prisma.SelectSubset<T, Prisma.CategoryFindManyArgs>
) => {
  return await prisma.category.findMany(payload)
}

export const createCategory = async (payload: Prisma.CategoryCreateArgs) => {
  await prisma.category.create(payload)
  revalidatePath('/dashboard/categories')
}

export const updateCategory = async ({ where, data }: Prisma.CategoryUpdateArgs) => {
  await prisma.category.update({ where, data })
  revalidatePath('/dashboard/categories')
}

export const deleteCategory = async (payload: Prisma.CategoryDeleteArgs) => {
  await prisma.category.delete(payload)
  revalidatePath('/dashboard/categories')
}
