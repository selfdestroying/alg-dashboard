'use server'
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { addToGroup } from './groups'

export type PaymentsWithStudentAndGroup = Prisma.PaymentGetPayload<{
  include: { student: true; group: { select: { id: true; name: true } } }
}> & { remainingLessons: number }

export const getPayments = async (): Promise<PaymentsWithStudentAndGroup[]> => {
  const payments = await prisma.payment.findMany({
    include: {
      student: true,
      group: {
        include: {
          lessons: {
            select: {
              id: true,
              attendance: {
                where: { asMakeupFor: null },
                select: {
                  studentId: true,
                  status: true,
                },
              },
            },
          },
        },
      },
    },
  })

  // Обогащаем каждую оплату количеством оставшихся занятий
  return payments.map((payment) => {
    const studentId = payment.studentId
    const lessonsPaid = payment.lessonsPaid

    const allAttendances = payment.group?.lessons.flatMap((lesson) => lesson.attendance) ?? []

    const attendedCount = allAttendances.filter(
      (a) => a.studentId === studentId && a.status === 'PRESENT'
    ).length

    const remainingLessons = lessonsPaid - attendedCount

    return {
      ...payment,
      remainingLessons,
    }
  })
}

export const createPayment = async (
  data: Prisma.PaymentUncheckedCreateInput,
  isAddToGroup: boolean
) => {
  await prisma.payment.upsert({
    where: {
      studentId_groupId: {
        studentId: data.studentId as number,
        groupId: data.groupId as number,
      },
    },
    update: {
      lessonsPaid: { increment: data.lessonsPaid },
      amount: { increment: data.amount as number },
    },
    create: data,
  })
  if (isAddToGroup)
    addToGroup({ groupId: data.groupId as number, studentId: data.studentId as number })
  revalidatePath('dashboard/payments')
}
