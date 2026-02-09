'use server'
import { Prisma } from '@/prisma/generated/client'
import prisma from '../lib/prisma'

export const getLocations = async <T extends Prisma.LocationFindManyArgs>(
  payload?: Prisma.SelectSubset<T, Prisma.LocationFindManyArgs>
) => {
  return await prisma.location.findMany(payload)
}
