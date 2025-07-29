'use server'
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export const createMakeUp = async (data: Prisma.MakeUpUncheckedCreateInput) => {
  await prisma.makeUp.create({ data })
}
