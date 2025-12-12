'use server'
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export type PaymentsWithStudentAndGroup = Prisma.PaymentGetPayload<{
  include: {
    student: true
  }
}>

export const getPayments = async (
  payload?: Prisma.PaymentFindManyArgs
): Promise<PaymentsWithStudentAndGroup[]> => {
  const payments = await prisma.payment.findMany({
    ...payload,
    include: {
      student: true,
    },
  })

  return payments
}

export const getUnprocessedPayments = async (payload?: Prisma.UnprocessedPaymentFindManyArgs) => {
  return await prisma.unprocessedPayment.findMany(payload)
}

export const updateUnprocessedPayment = async (payload: Prisma.UnprocessedPaymentUpdateArgs) => {
  await prisma.unprocessedPayment.update(payload)
  revalidatePath('/dashboard/payments')
}

export const createPayment = async (payload: Prisma.PaymentCreateArgs) => {
  await prisma.payment.create(payload)
  // if (isAddToGroup)
  //   addToGroup({ groupId: data.groupId as number, studentId: data.studentId as number }, false)
  revalidatePath('dashboard/payments')
}

export const createPaymentProduct = async (payload: Prisma.PaymentProductCreateArgs) => {
  const product = await prisma.paymentProduct.create(payload)
  revalidatePath('/dashboard/payments')
  return product
}

export const deletePaymentProduct = async (id: number) => {
  await prisma.paymentProduct.delete({ where: { id } })
  revalidatePath('/dashboard/payments')
}
