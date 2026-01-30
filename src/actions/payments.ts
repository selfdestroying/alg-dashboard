'use server'
import { requireActorUserId, writeLessonsBalanceHistoryTx } from '@/lib/lessons-balance'
import { prisma } from '@/lib/prisma'
import { Prisma, StudentLessonsBalanceChangeReason } from '@prisma/client'
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
  revalidatePath('/dashboard/finances/payments')
}

export const deletePayment = async (payload: Prisma.PaymentDeleteArgs) => {
  await prisma.payment.delete(payload)
  revalidatePath('/dashboard/finances/payments')
}

export const cancelPayment = async (payload: Prisma.PaymentDeleteArgs) => {
  const actorUserId = await requireActorUserId()
  await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.delete(payload)

    const student = await tx.student.findUnique({
      where: { id: payment.studentId },
      select: { lessonsBalance: true },
    })
    if (!student) throw new Error('Ученик не найден')
    const balanceBefore = student.lessonsBalance

    await tx.student.update({
      where: { id: payment.studentId },
      data: {
        totalLessons: { decrement: payment.lessonCount },
        totalPayments: { decrement: payment.price },
        lessonsBalance: { decrement: payment.lessonCount },
      },
    })

    const balanceAfter = balanceBefore - payment.lessonCount
    await writeLessonsBalanceHistoryTx(tx, {
      studentId: payment.studentId,
      actorUserId,
      reason: StudentLessonsBalanceChangeReason.PAYMENT_CANCELLED,
      delta: balanceAfter - balanceBefore,
      balanceBefore,
      balanceAfter,
      meta: {
        paymentId: payment.id,
        lessonCount: payment.lessonCount,
        price: payment.price,
      },
    })
  })
  revalidatePath('/dashboard/finances/payments')
}

export const createPaymentProduct = async (payload: Prisma.PaymentProductCreateArgs) => {
  await prisma.paymentProduct.create(payload)
  revalidatePath('/dashboard/finances/payments')
}

export const deletePaymentProduct = async (payload: Prisma.PaymentProductDeleteArgs) => {
  await prisma.paymentProduct.delete(payload)
  revalidatePath('/dashboard/finances/payments')
}

export const getUnprocessedPayments = async <T extends Prisma.UnprocessedPaymentFindManyArgs>(
  payload?: Prisma.SelectSubset<T, Prisma.UnprocessedPaymentFindManyArgs>
) => {
  return await prisma.unprocessedPayment.findMany(payload)
}

export const updateUnprocessedPayment = async (payload: Prisma.UnprocessedPaymentUpdateArgs) => {
  await prisma.unprocessedPayment.update(payload)
  revalidatePath('/dashboard/finances/payments')
}

export const deleteUnprocessedPayment = async (payload: Prisma.UnprocessedPaymentDeleteArgs) => {
  await prisma.unprocessedPayment.delete(payload)
  revalidatePath('/dashboard/finances/payments')
}
