'use server'

import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export const getCategories = async () => {
  return await prisma.category.findMany()
}

export const createCategory = async (
  data: Prisma.XOR<Prisma.CategoryCreateInput, Prisma.CategoryUncheckedCreateInput>
) => {
  await prisma.category.create({ data })
  revalidatePath('/dashboard/categories')
}
