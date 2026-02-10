'use server'
import { Prisma } from '@/prisma/generated/client'
import { withSessionRLS } from '../lib/rls'

export const getLocations = async <T extends Prisma.LocationFindManyArgs>(
  payload?: Prisma.SelectSubset<T, Prisma.LocationFindManyArgs>
) => {
  return withSessionRLS((tx) => tx.location.findMany(payload))
}
