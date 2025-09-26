'use server'
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { addToGroup } from './groups'

export type PaymentsWithStudentAndGroup = Prisma.PaymentGetPayload<{
  include: {
    studentGroup: {
      include: {
        group: true
        student: true
      }
    }
  }
}> & { remainingLessons: number }

export const getPayments = async (): Promise<PaymentsWithStudentAndGroup[]> => {
  const payments = await prisma.payment.findMany({
    include: {
      studentGroup: {
        include: {
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
          student: true,
        },
      },
    },
  })

  // Обогащаем каждую оплату количеством оставшихся занятий
  return payments.map((payment) => {
    const studentId = payment.studentId
    const lessonCount = payment.lessonCount

    const allAttendances =
      payment.studentGroup.group?.lessons.flatMap((lesson) => lesson.attendance) ?? []

    const attendedCount = allAttendances.filter(
      (a) => a.studentId === studentId && a.status === 'PRESENT'
    ).length

    const remainingLessons = lessonCount - attendedCount

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
      lessonCount: { increment: data.lessonCount },
      price: { increment: data.price as number },
    },
    create: data,
  })
  if (isAddToGroup)
    addToGroup({ groupId: data.groupId as number, studentId: data.studentId as number }, false)
  revalidatePath('dashboard/payments')
}
