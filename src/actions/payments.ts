'use server'
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export type PaymentsWithStudentAndGroup = Prisma.PaymentGetPayload<{
  include: {
    student: true
  }
}>

export const getPayments = async (): Promise<PaymentsWithStudentAndGroup[]> => {
  const payments = await prisma.payment.findMany({
    include: {
      student: true,
    },
  })

  return payments
}

export const createPayment = async (
  data: Prisma.PaymentUncheckedCreateInput,
  isAddToGroup: boolean
) => {
  await prisma.payment.upsert({
    where: {
      id: data.id,
      studentId: data.studentId,
    },
    update: {
      lessonCount: { increment: data.lessonCount },
      price: { increment: data.price as number },
    },
    create: data,
  })
  // if (isAddToGroup)
  //   addToGroup({ groupId: data.groupId as number, studentId: data.studentId as number }, false)
  revalidatePath('dashboard/payments')
}
