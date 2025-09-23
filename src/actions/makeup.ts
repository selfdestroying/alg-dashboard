'use server'
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export const createMakeUp = async (data: Prisma.MakeUpUncheckedCreateInput) => {
  const makeUp = await prisma.makeUp.create({
    data,
    include: { missedAttendance: true },
  })
  revalidatePath(`/dashboard/lessons/${makeUp.missedAttendance.lessonId}`)
}
