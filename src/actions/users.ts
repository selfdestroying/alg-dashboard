'use server'
import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/session'
import { Prisma } from '@prisma/client'

import bcrypt from 'bcrypt'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'

export type UserData = Prisma.UserGetPayload<{
  include: { role: true }
  omit: { password: true }
}>

export const getMe = cache(async (): Promise<UserData | null> => {
  const { isAuth, userId } = await verifySession()
  if (!isAuth || userId === null) {
    return null
  }
  const user = await prisma.user.findFirst({
    where: { id: userId },
    include: { role: true },
    omit: { password: true },
  })

  return user
})

export const getUserById = async <T extends Prisma.UserFindFirstArgs>(
  payload: Prisma.SelectSubset<T, Prisma.UserFindFirstArgs>
) => {
  return await prisma.user.findFirst(payload)
}

export const updateUser = async (payload: Prisma.UserUpdateArgs, pathToRevalidate?: string) => {
  await prisma.user.update(payload)
  if (pathToRevalidate) revalidatePath(pathToRevalidate)
}

export const getUsers = async <T extends Prisma.UserFindManyArgs>(
  payload?: Prisma.SelectSubset<T, Prisma.UserFindManyArgs>
) => {
  const users = await prisma.user.findMany<T>(payload)
  return users
}

export const createUser = async (payload: Prisma.UserCreateArgs) => {
  const hashedPassword = await bcrypt.hash(payload.data.password, 10)

  const user = await prisma.user.create({
    data: {
      ...payload.data,
      password: hashedPassword,
    },
    omit: { password: true },
  })
  revalidatePath('dashboard/users')
  return user
}
