'use server'
import prisma from '@/src/lib/db/prisma'

import { revalidatePath } from 'next/cache'
import { Prisma } from '../../prisma/generated/client'

export const updateUser = async (payload: Prisma.UserUpdateArgs) => {
  await prisma.user.update(payload)
  revalidatePath(`dashboard/users/${payload.where.id}`)
}
