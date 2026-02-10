'use server'
import { revalidatePath } from 'next/cache'
import { Prisma } from '../../prisma/generated/client'
import { withSessionRLS } from '../lib/rls'

export const createMakeUp = async (data: Prisma.MakeUpUncheckedCreateInput) => {
  const makeUp = await withSessionRLS((tx) =>
    tx.makeUp.create({
      data,
      include: { missedAttendance: true },
    })
  )
  revalidatePath(`/dashboard/lessons/${makeUp.missedAttendance.lessonId}`)
}
