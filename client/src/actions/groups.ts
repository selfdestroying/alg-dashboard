'use server'

import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export type GroupWithTeacher = Prisma.GroupGetPayload<{ include: { teacher: true; course: true } }>

export const getGroups = async (): Promise<GroupWithTeacher[]> => {
  const groups = await prisma.group.findMany({
    include: { teacher: true, course: true },
  })
  return groups
}

export const createGroup = async (data: Prisma.GroupCreateInput) => {
  await prisma.group.create({ data })
  revalidatePath('dashboard/groups')
}

export const deleteGroup = async (id: number) => {
  await prisma.group.delete({ where: { id } })
  revalidatePath('dashboard/groups')
}
