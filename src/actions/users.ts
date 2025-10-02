'use server'
import prisma from '@/lib/prisma'
import { verifySession } from '@/lib/session'
import { Prisma } from '@prisma/client'
import { cache } from 'react'

export type UserData = Prisma.UserGetPayload<{
  omit: { password: true; passwordRequired: true; createdAt: true }
}>

export const getUser = cache(async (): Promise<UserData | null> => {
  const { isAuth, userId } = await verifySession()
  if (!isAuth || userId === null) {
    return null
  }
  const user = await prisma.user.findFirst({
    where: { id: userId },
    omit: { password: true, passwordRequired: true, createdAt: true },
  })
  return user
})

export const getUsers = async (): Promise<UserData[]> => {
  const users: UserData[] = await prisma.user.findMany({
    omit: { createdAt: true, password: true, passwordRequired: true },
  })
  return users
}
