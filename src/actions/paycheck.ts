'use server'

import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export async function getPaychecks(payload: Prisma.PayCheckFindManyArgs) {
  const paychecks = await prisma.payCheck.findMany(payload)
  return paychecks
}

export async function getPaycheck(payload: Prisma.PayCheckFindFirstArgs) {
  const paycheck = await prisma.payCheck.findFirst(payload)
  return paycheck
}

export async function createPaycheck(payload: Prisma.PayCheckCreateArgs) {
  await prisma.payCheck.create(payload)
  revalidatePath(`/dashboard/users/${payload.data.userId}`)
}

export async function updatePaycheck(payload: Prisma.PayCheckUpdateArgs) {
  await prisma.payCheck.update(payload)
  revalidatePath(`/dashboard/users/${payload.data.userId}`)
}

export async function deletePaycheck(payload: Prisma.PayCheckDeleteArgs) {
  await prisma.payCheck.delete(payload)
  revalidatePath(`/dashboard/users/${payload.where.userId}`)
}
