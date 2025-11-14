'use server'

import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export type DismissedWithStudentAndGroup = Prisma.DismissedGetPayload<{
  include: { student: true; group: true }
}>

export async function getDismissed(payload: Prisma.DismissedFindFirstArgs) {
  const dismissed = await prisma.dismissed.findMany(payload)
  return dismissed
}

export async function dismissStudent(payload: Prisma.DismissedCreateArgs) {
  await prisma.dismissed.create(payload)
}
