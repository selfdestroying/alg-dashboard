'use server'

import { revalidatePath } from 'next/cache'
import { Prisma } from '../../prisma/generated/client'
import { withSessionRLS } from '../lib/rls'

export async function getPaychecks(payload: Prisma.PayCheckFindManyArgs) {
  return withSessionRLS((tx) => tx.payCheck.findMany(payload))
}

export async function getPaycheck(payload: Prisma.PayCheckFindFirstArgs) {
  return withSessionRLS((tx) => tx.payCheck.findFirst(payload))
}

export async function createPaycheck(payload: Prisma.PayCheckCreateArgs) {
  await withSessionRLS((tx) => tx.payCheck.create(payload))
  revalidatePath(`/dashboard/users/${payload.data.userId}`)
}

export async function updatePaycheck(payload: Prisma.PayCheckUpdateArgs) {
  await withSessionRLS((tx) => tx.payCheck.update(payload))
  revalidatePath(`/dashboard/users/${payload.data.userId}`)
}

export async function deletePaycheck(payload: Prisma.PayCheckDeleteArgs) {
  await withSessionRLS((tx) => tx.payCheck.delete(payload))
  revalidatePath(`/dashboard/users/${payload.where.userId}`)
}
