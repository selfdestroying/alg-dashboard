'use server'

import { revalidatePath } from 'next/cache'
import { Prisma } from '../../prisma/generated/client'
import { withSessionRLS } from '../lib/rls'

export const getCategories = async <T extends Prisma.CategoryFindManyArgs>(
  payload?: Prisma.SelectSubset<T, Prisma.CategoryFindManyArgs>
) => {
  return withSessionRLS((tx) => tx.category.findMany(payload))
}

export const createCategory = async (payload: Prisma.CategoryCreateArgs) => {
  await withSessionRLS((tx) => tx.category.create(payload))
  revalidatePath('/dashboard/categories')
}

export const updateCategory = async ({ where, data }: Prisma.CategoryUpdateArgs) => {
  await withSessionRLS((tx) => tx.category.update({ where, data }))
  revalidatePath('/dashboard/categories')
}

export const deleteCategory = async (payload: Prisma.CategoryDeleteArgs) => {
  await withSessionRLS((tx) => tx.category.delete(payload))
  revalidatePath('/dashboard/categories')
}
