'use server'

import prisma from '@/src/lib/db/prisma'
import { writeLessonsBalanceHistoryTx } from '@/src/lib/lessons-balance'
import { formatDateOnly } from '@/src/lib/timezone'
import { getGroupName, protocol, rootDomain } from '@/src/lib/utils'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Prisma } from '../../prisma/generated/client'
import { AttendanceStatus, StudentLessonsBalanceChangeReason } from '../../prisma/generated/enums'
import { auth } from '../lib/auth/server'

export type AttendanceWithStudents = Prisma.AttendanceGetPayload<{
  include: {
    student: true
    lesson: {
      include: {
        group: {
          include: {
            course: true
            location: true
            teachers: {
              include: {
                teacher: true
              }
            }
          }
        }
      }
    }
    asMakeupFor: { include: { missedAttendance: { include: { lesson: true } } } }
    missedMakeup: { include: { makeUpAttendance: { include: { lesson: true } } } }
  }
}>

export const createAttendance = async (data: Prisma.AttendanceUncheckedCreateInput) => {
  const attendance = await prisma.attendance.create({ data })
  revalidatePath(`dashboard/lessons/${data.lessonId}`)
  return attendance
}

const updateCoins = async (
  tx: Prisma.TransactionClient,
  newStatus: AttendanceStatus,
  oldStatus: AttendanceStatus,
  studentId: number,
) => {
  if (newStatus === AttendanceStatus.PRESENT && oldStatus !== AttendanceStatus.PRESENT) {
    await tx.student.update({
      where: { id: studentId },
      data: { coins: { increment: 10 } },
    })
  } else if (newStatus !== AttendanceStatus.PRESENT && oldStatus === AttendanceStatus.PRESENT) {
    await tx.student.update({
      where: { id: studentId },
      data: { coins: { decrement: 10 } },
    })
  }
}

const isLessonCharged = (status: AttendanceStatus, isWarned: boolean): boolean => {
  if (status === AttendanceStatus.PRESENT) return true
  if (status === AttendanceStatus.ABSENT && !isWarned) return true
  return false
}

const getLessonsBalanceDelta = (
  oldStatus: AttendanceStatus,
  newStatus: AttendanceStatus,
  oldIsWarned: boolean | null,
  newIsWarned: boolean | null,
): number => {
  const wasCharged = isLessonCharged(oldStatus, oldIsWarned === true)

  const isCharged = isLessonCharged(newStatus, newIsWarned === true)

  if (wasCharged === isCharged) return 0
  return isCharged ? -1 : +1
}

export const updateAttendance = async (payload: Prisma.AttendanceUpdateArgs) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) {
    redirect(`${protocol}://auth.${rootDomain}/sign-in`)
  }
  const status = payload.data.status
  const isWarned = payload.data.isWarned
  const studentId = payload.where.studentId_lessonId?.studentId
  const lessonId = payload.where.studentId_lessonId?.lessonId

  // Read outside the transaction to avoid parallel sub-queries on the same
  // pg.Client (deep includes may trigger concurrent relation-loading queries
  // inside a transaction, causing pg DeprecationWarning).
  const oldAttendance =
    status && studentId && lessonId
      ? await prisma.attendance.findFirst({
          where: {
            studentId,
            lessonId,
          },
          include: {
            lesson: {
              include: {
                group: {
                  include: {
                    course: true,
                    location: true,
                    schedules: true,
                  },
                },
              },
            },
            asMakeupFor: {
              include: {
                missedAttendance: {
                  include: {
                    lesson: true,
                  },
                },
              },
            },
          },
        })
      : null

  await prisma.$transaction(async (tx) => {
    if (oldAttendance && oldAttendance.studentStatus !== 'TRIAL') {
      await updateCoins(
        tx,
        status as AttendanceStatus,
        oldAttendance.status,
        oldAttendance.studentId,
      )

      const delta = getLessonsBalanceDelta(
        oldAttendance.status,
        status as AttendanceStatus,
        oldAttendance.isWarned,
        isWarned as boolean | null,
      )

      if (delta !== 0) {
        const groupId = oldAttendance.asMakeupFor
          ? oldAttendance.asMakeupFor.missedAttendance.lesson.groupId
          : oldAttendance.lesson.groupId
        const studentGroup = await tx.studentGroup.findUnique({
          where: { studentId_groupId: { studentId: oldAttendance.studentId, groupId } },
          select: { lessonsBalance: true },
        })
        if (!studentGroup) throw new Error('Ученик не найден в группе')

        const balanceBefore = studentGroup.lessonsBalance
        const updated = await tx.studentGroup.update({
          where: { studentId_groupId: { studentId: oldAttendance.studentId, groupId } },
          data: {
            lessonsBalance: delta > 0 ? { increment: delta } : { decrement: Math.abs(delta) },
          },
          select: { lessonsBalance: true },
        })

        const balanceAfter = updated.lessonsBalance
        const isMakeupAttendance = Boolean(oldAttendance.asMakeupFor)

        const reason = (() => {
          if (delta >= 0) return StudentLessonsBalanceChangeReason.ATTENDANCE_REVERTED

          // delta < 0 => списание 1 урока
          if (isMakeupAttendance) {
            return StudentLessonsBalanceChangeReason.MAKEUP_ATTENDED_CHARGED
          }

          if (status === AttendanceStatus.PRESENT) {
            return StudentLessonsBalanceChangeReason.ATTENDANCE_PRESENT_CHARGED
          }

          return StudentLessonsBalanceChangeReason.ATTENDANCE_ABSENT_CHARGED
        })()

        const lessonName =
          getGroupName(oldAttendance.lesson.group) + ` ${formatDateOnly(oldAttendance.lesson.date)}`

        await writeLessonsBalanceHistoryTx(tx, {
          organizationId: session.organizationId!,
          studentId: oldAttendance.studentId,
          actorUserId: Number(session.user.id),
          groupId,
          reason,
          delta: balanceAfter - balanceBefore,
          balanceBefore,
          balanceAfter,
          meta: {
            attendanceId: oldAttendance.id,
            lessonId: oldAttendance.lessonId,
            lessonName,
            groupId,

            oldStatus: oldAttendance.status,
            newStatus: status,
            oldIsWarned: oldAttendance.isWarned,
            newIsWarned: isWarned,
            isMakeupAttendance,
          },
        })
      }
    }

    await tx.attendance.update(payload)
  })
  revalidatePath(`/lessons/${payload.where.studentId_lessonId?.lessonId}`)
}

export const updateAttendanceComment = async (payload: Prisma.AttendanceUpdateArgs) => {
  await prisma.attendance.update(payload)
}

export const updateDataMock = async (time: number) => {
  await new Promise((resolve) => setTimeout(resolve, time))
}

export const deleteAttendance = async (data: Prisma.AttendanceDeleteArgs) => {
  await prisma.attendance.delete(data)

  revalidatePath(`/lessons/${data.where.lessonId}`)
}
