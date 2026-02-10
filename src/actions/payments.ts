'use server'
import { writeLessonsBalanceHistoryTx } from '@/src/lib/lessons-balance'
import prisma from '@/src/lib/prisma'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Prisma, StudentLessonsBalanceChangeReason } from '../../prisma/generated/client'
import { auth } from '../lib/auth'
import { enableRLS, withSessionRLS } from '../lib/rls'
import { protocol, rootDomain } from '../lib/utils'

export type PaymentsWithStudentAndGroup = Prisma.PaymentGetPayload<{
  include: {
    student: true
  }
}>

export const getPayments = async <T extends Prisma.PaymentFindManyArgs>(
  payload?: Prisma.SelectSubset<T, Prisma.PaymentFindManyArgs>
) => {
  return withSessionRLS((tx) => tx.payment.findMany<T>(payload))
}

export const createPayment = async (payload: Prisma.PaymentCreateArgs) => {
  await withSessionRLS((tx) => tx.payment.create(payload))
  revalidatePath('/dashboard/finances/payments')
}

export const deletePayment = async (payload: Prisma.PaymentDeleteArgs) => {
  await withSessionRLS((tx) => tx.payment.delete(payload))
  revalidatePath('/dashboard/finances/payments')
}

export const cancelPayment = async (payload: Prisma.PaymentDeleteArgs) => {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({
    headers: requestHeaders,
  })
  if (!session) {
    redirect(`${protocol}://auth.${rootDomain}/sign-in`)
  }

  await prisma.$transaction(async (tx) => {
    await enableRLS(tx, session.members[0].organizationId)

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
      organizationId: session.members[0].organizationId,
      studentId: payment.studentId,
      actorUserId: Number(session.user.id),
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
  await withSessionRLS((tx) => tx.paymentProduct.create(payload))
  revalidatePath('/dashboard/finances/payments')
}

export const deletePaymentProduct = async (payload: Prisma.PaymentProductDeleteArgs) => {
  await withSessionRLS((tx) => tx.paymentProduct.delete(payload))
  revalidatePath('/dashboard/finances/payments')
}

export const getUnprocessedPayments = async <T extends Prisma.UnprocessedPaymentFindManyArgs>(
  payload?: Prisma.SelectSubset<T, Prisma.UnprocessedPaymentFindManyArgs>
) => {
  return withSessionRLS((tx) => tx.unprocessedPayment.findMany(payload))
}

export const updateUnprocessedPayment = async (payload: Prisma.UnprocessedPaymentUpdateArgs) => {
  await withSessionRLS((tx) => tx.unprocessedPayment.update(payload))
  revalidatePath('/dashboard/finances/payments')
}

export const deleteUnprocessedPayment = async (payload: Prisma.UnprocessedPaymentDeleteArgs) => {
  await withSessionRLS((tx) => tx.unprocessedPayment.delete(payload))
  revalidatePath('/dashboard/finances/payments')
}
