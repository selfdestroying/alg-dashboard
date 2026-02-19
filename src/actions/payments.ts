'use server'
import { writeFinancialHistoryTx } from '@/src/lib/lessons-balance'
import prisma from '@/src/lib/prisma'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Prisma, StudentLessonsBalanceChangeReason } from '../../prisma/generated/client'
import { StudentFinancialField } from '../../prisma/generated/enums'
import { auth } from '../lib/auth'
import { protocol, rootDomain } from '../lib/utils'

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
  const requestHeaders = await headers()
  const session = await auth.api.getSession({
    headers: requestHeaders,
  })
  if (!session) {
    redirect(`${protocol}://auth.${rootDomain}/sign-in`)
  }

  await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.delete(payload)

    const student = await tx.student.findUnique({
      where: { id: payment.studentId },
      select: { lessonsBalance: true, totalPayments: true, totalLessons: true },
    })
    if (!student) throw new Error('Ученик не найден')

    const updated = await tx.student.update({
      where: { id: payment.studentId },
      data: {
        totalLessons: { decrement: payment.lessonCount },
        totalPayments: { decrement: payment.price },
        lessonsBalance: { decrement: payment.lessonCount },
      },
      select: { lessonsBalance: true, totalPayments: true, totalLessons: true },
    })

    const commonMeta = {
      paymentId: payment.id,
      lessonCount: payment.lessonCount,
      price: payment.price,
    }

    const fields = [
      {
        field: StudentFinancialField.LESSONS_BALANCE,
        key: 'lessonsBalance' as const,
      },
      {
        field: StudentFinancialField.TOTAL_PAYMENTS,
        key: 'totalPayments' as const,
      },
      {
        field: StudentFinancialField.TOTAL_LESSONS,
        key: 'totalLessons' as const,
      },
    ]

    for (const f of fields) {
      const before = student[f.key]
      const after = updated[f.key]
      await writeFinancialHistoryTx(tx, {
        organizationId: session.organizationId!,
        studentId: payment.studentId,
        actorUserId: Number(session.user.id),
        field: f.field,
        reason: StudentLessonsBalanceChangeReason.PAYMENT_CANCELLED,
        delta: after - before,
        balanceBefore: before,
        balanceAfter: after,
        meta: commonMeta,
      })
    }
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
