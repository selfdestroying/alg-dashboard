'use server'
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export type PaymentsWithStudentAndGroup = Prisma.PaymentGetPayload<{
  include: { student: true; group: { select: { id: true; name: true } } }
}>

export const getPayments = async (): Promise<PaymentsWithStudentAndGroup[]> => {
  const payments = await prisma.payment.findMany({
    include: { student: true, group: { select: { id: true, name: true } } },
  })
  return payments
}

export const createPayment = async (data: Prisma.PaymentCreateManyInput) => {
  await prisma.payment.upsert({
    where: {
      studentId_groupId: {
        studentId: data.studentId as number,
        groupId: data.groupId as number,
      },
    },
    update: {
      lessonsPaid: { increment: data.lessonsPaid },
    },
    create: data,
  })
  revalidatePath('dashboard/payments')
}
