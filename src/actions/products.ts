'use server'

import prisma from '@/src/lib/db/prisma'
import { Prisma } from '../../prisma/generated/client'

export type ProductWithCategory = Prisma.ProductGetPayload<{ include: { category: true } }>

export const getProducts = async <T extends Prisma.ProductFindManyArgs>(
  payload?: Prisma.SelectSubset<T, Prisma.ProductFindManyArgs>,
) => {
  return await prisma.product.findMany<T>(payload)
}
