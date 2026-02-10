'use server'
import { Prisma } from '@/prisma/generated/client'
import { withSessionRLS } from '../lib/rls'

export const getMembers = async <T extends Prisma.MemberFindManyArgs>(
  payload?: Prisma.SelectSubset<T, Prisma.MemberFindManyArgs>
) => {
  return withSessionRLS((tx) => tx.member.findMany(payload))
}
