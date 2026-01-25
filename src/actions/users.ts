'use server'
import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/session'
import { Prisma } from '@prisma/client'

import bcrypt from 'bcrypt'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'

export const getMe = cache(async () => {
  const { isAuth, userId } = await verifySession()
  if (!isAuth || userId === null) {
    return null
  }
  const user = await prisma.user.findFirst({
    where: { id: userId },
    include: { role: true },
  })

  return user
})

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

export const getUsers = async <T extends Prisma.UserFindManyArgs>(
  payload?: Prisma.SelectSubset<T, Prisma.UserFindManyArgs>
) => {
  return await prisma.user.findMany<T>(payload)
}

export const getUser = async <T extends Prisma.UserFindFirstArgs>(
  payload: Prisma.SelectSubset<T, Prisma.UserFindFirstArgs>
) => {
  return await prisma.user.findFirst(payload)
}

export const updateUser = async (payload: Prisma.UserUpdateArgs, isApplyToLessons: boolean) => {
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.update(payload)
    if (isApplyToLessons) {
      await tx.teacherLesson.updateMany({
        where: {
          teacherId: user.id,
          lesson: {
            date: { gt: new Date() },
            group: { type: 'GROUP' },
          },
        },
        data: {
          bid: user.bidForLesson,
        },
      })
      await tx.teacherLesson.updateMany({
        where: {
          teacherId: user.id,
          lesson: {
            date: { gt: new Date() },
            group: { type: 'INDIVIDUAL' },
          },
        },
        data: {
          bid: user.bidForIndividual,
        },
      })
      await tx.teacherGroup.updateMany({
        where: {
          teacherId: user.id,
          group: { type: 'GROUP' },
        },
        data: {
          bid: user.bidForLesson,
        },
      })
      await tx.teacherGroup.updateMany({
        where: {
          teacherId: user.id,
          group: { type: 'INDIVIDUAL' },
        },
        data: {
          bid: user.bidForIndividual,
        },
      })
    }
  })

  revalidatePath(`dashboard/users/${payload.where.id}`)
}
