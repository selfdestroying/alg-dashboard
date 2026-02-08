'use server'
import { Prisma } from '@/prisma/generated/client'
import prisma from '../lib/prisma'

export const getMembers = async <T extends Prisma.MemberFindManyArgs>(
  payload?: Prisma.SelectSubset<T, Prisma.MemberFindManyArgs>
) => {
  return await prisma.member.findMany(payload)
}
