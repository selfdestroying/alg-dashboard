'use server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export type PaymentsWithStudentAndGroup = Prisma.PaymentGetPayload<{
  include: {
    student: true
  }
}>

export const getPayments = async <T extends Prisma.PaymentFindManyArgs>(
  payload?: Prisma.SelectSubset<T, Prisma.PaymentFindManyArgs>
) => {
  return await prisma.payment.findMany<T>(payload)
}

export const createPayment = async (payload: Prisma.PaymentCreateArgs) => {
  await prisma.payment.create(payload)
  revalidatePath('/dashboard/payments')
}

export const deletePayment = async (payload: Prisma.PaymentDeleteArgs) => {
  await prisma.payment.delete(payload)
  revalidatePath('/dashboard/payments')
}

export const cancelPayment = async (payload: Prisma.PaymentDeleteArgs) => {
  await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.delete(payload)
    await tx.student.update({
      where: { id: payment.studentId },
      data: {
        totalLessons: { decrement: payment.lessonCount },
        totalPayments: { decrement: payment.price },
        lessonsBalance: { decrement: payment.lessonCount },
      },
    })
  })
  revalidatePath('/dashboard/payments')
}

export const createPaymentProduct = async (payload: Prisma.PaymentProductCreateArgs) => {
  await prisma.paymentProduct.create(payload)
  revalidatePath('/dashboard/payments')
}

export const deletePaymentProduct = async (payload: Prisma.PaymentProductDeleteArgs) => {
  await prisma.paymentProduct.delete(payload)
  revalidatePath('/dashboard/payments')
}

export const getUnprocessedPayments = async <T extends Prisma.UnprocessedPaymentFindManyArgs>(
  payload?: Prisma.SelectSubset<T, Prisma.UnprocessedPaymentFindManyArgs>
) => {
  return await prisma.unprocessedPayment.findMany(payload)
}

export const updateUnprocessedPayment = async (payload: Prisma.UnprocessedPaymentUpdateArgs) => {
  await prisma.unprocessedPayment.update(payload)
  revalidatePath('/dashboard/payments')
}

export const deleteUnprocessedPayment = async (payload: Prisma.UnprocessedPaymentDeleteArgs) => {
  await prisma.unprocessedPayment.delete(payload)
  revalidatePath('/dashboard/payments')
}
