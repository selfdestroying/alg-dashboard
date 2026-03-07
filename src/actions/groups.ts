'use server'

import prisma from '@/src/lib/db/prisma'
import { writeFinancialHistoryTx } from '@/src/lib/lessons-balance'
import { moscowNow, normalizeDateOnly } from '@/src/lib/timezone'
import { getGroupName } from '@/src/lib/utils'
import { revalidatePath } from 'next/cache'
import { Prisma } from '../../prisma/generated/client'
import {
  StudentFinancialField,
  StudentLessonsBalanceChangeReason,
} from '../../prisma/generated/enums'

export const getGroups = async <T extends Prisma.GroupFindManyArgs>(
  payload?: Prisma.SelectSubset<T, Prisma.GroupFindManyArgs>,
) => {
  return await prisma.group.findMany<T>(payload)
}

export const getGroup = async <T extends Prisma.GroupFindFirstArgs>(
  payload?: Prisma.SelectSubset<T, Prisma.GroupFindFirstArgs>,
) => {
  return await prisma.group.findFirst(payload)
}

export const createGroup = async (
  payload: Prisma.GroupCreateArgs,
  schedule?: Array<{ dayOfWeek: number; time: string }>,
) => {
  await prisma.$transaction(async (tx) => {
    const group = await tx.group.create({
      ...payload,
      include: {
        teachers: {
          include: { rate: true },
        },
        lessons: { select: { id: true } },
      },
    })
    const firstTeacher = group.teachers[0]
    if (!firstTeacher) throw new Error('Group must have at least one teacher')
    const lessons = group.lessons.map((l) => ({
      organizationId: group.organizationId,
      lessonId: l.id,
      teacherId: firstTeacher.teacherId,
      bid: firstTeacher.rate.bid,
      bonusPerStudent: firstTeacher.rate.bonusPerStudent,
    }))
    await tx.teacherLesson.createMany({
      data: lessons,
    })
    if (schedule && schedule.length > 0) {
      await tx.groupSchedule.createMany({
        data: schedule.map((s) => ({
          dayOfWeek: s.dayOfWeek,
          time: s.time,
          groupId: group.id,
          organizationId: group.organizationId,
        })),
      })
    }
  })

  revalidatePath('dashboard/groups')
}

export const updateGroup = async (payload: Prisma.GroupUpdateArgs) => {
  await prisma.group.update(payload)
  revalidatePath(`/groups/${payload.where.id}`)
}

export const deleteGroup = async (payload: Prisma.GroupDeleteArgs) => {
  await prisma.group.delete(payload)
  revalidatePath('dashboard/groups')
}

export const updateGroupSchedule = async (
  groupId: number,
  organizationId: number,
  schedule: Array<{ dayOfWeek: number; time: string }>,
) => {
  await prisma.$transaction(async (tx) => {
    await tx.groupSchedule.deleteMany({ where: { groupId } })
    await tx.groupSchedule.createMany({
      data: schedule.map((s) => ({
        dayOfWeek: s.dayOfWeek,
        time: s.time,
        groupId,
        organizationId,
      })),
    })
  })
  revalidatePath(`/groups/${groupId}`)
}

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]

export const regenerateLessons = async (
  groupId: number,
  organizationId: number,
  startDate: Date,
  lessonCount: number,
) => {
  await prisma.$transaction(async (tx) => {
    // 1. Fetch schedules
    const schedules = await tx.groupSchedule.findMany({
      where: { groupId },
    })
    if (schedules.length === 0) throw new Error('Группа не имеет расписания')

    const sortedSchedules = [...schedules].sort(
      (a, b) => DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek),
    )
    const scheduleDaysMap = new Map(sortedSchedules.map((s) => [s.dayOfWeek, s.time]))

    // 2. Delete future lessons (cascade deletes attendance & teacher-lesson)
    await tx.lesson.deleteMany({
      where: {
        groupId,
        date: { gte: startDate },
      },
    })

    // 3. Generate new lesson dates
    const lessons: Array<{ date: Date; time: string; organizationId: number }> = []
    const currentDate = new Date(startDate.getTime())
    const maxIterations = lessonCount * 7 + 7

    for (let i = 0; i < maxIterations && lessons.length < lessonCount; i++) {
      const time = scheduleDaysMap.get(currentDate.getUTCDay())
      if (time) {
        lessons.push({
          date: new Date(currentDate.getTime()),
          time,
          organizationId,
        })
      }
      currentDate.setUTCDate(currentDate.getUTCDate() + 1)
    }

    // 4. Create lessons
    const createdLessons = await Promise.all(
      lessons.map((l) =>
        tx.lesson.create({
          data: {
            date: l.date,
            time: l.time,
            organizationId: l.organizationId,
            groupId,
          },
        }),
      ),
    )

    // 5. Assign teachers to all new lessons
    const teachers = await tx.teacherGroup.findMany({
      where: { groupId },
      include: { rate: true },
    })

    if (teachers.length > 0) {
      const teacherLessonData = createdLessons.flatMap((lesson) =>
        teachers.map((t) => ({
          organizationId,
          lessonId: lesson.id,
          teacherId: t.teacherId,
          bid: t.rate.bid,
          bonusPerStudent: t.rate.bonusPerStudent,
        })),
      )
      await tx.teacherLesson.createMany({ data: teacherLessonData })
    }

    // 6. Create UNSPECIFIED attendance for active students
    const students = await tx.studentGroup.findMany({
      where: { groupId, status: { in: ['ACTIVE', 'TRIAL'] } },
    })

    if (students.length > 0) {
      const attendanceData = createdLessons.flatMap((lesson) =>
        students.map((s) => ({
          organizationId,
          lessonId: lesson.id,
          studentId: s.studentId,
          status: 'UNSPECIFIED' as const,
          studentStatus: s.status,
          comment: '',
        })),
      )
      await tx.attendance.createMany({ data: attendanceData })
    }
  })

  revalidatePath(`/groups/${groupId}`)
}

// Student-Group Relations

export const createStudentGroup = async (
  payload: Prisma.StudentGroupCreateArgs,
  isApplyToLessons: boolean,
) => {
  await prisma.$transaction(async (tx) => {
    await tx.studentGroup.create(payload)

    if (!isApplyToLessons) return

    const todayDate = normalizeDateOnly(moscowNow())

    const futureLessons = await tx.lesson.findMany({
      where: {
        groupId: payload.data.groupId,
        date: { gte: todayDate },
      },
      select: { id: true, organizationId: true },
    })

    if (futureLessons.length > 0) {
      const attendanceData = futureLessons.map((lesson) => ({
        organizationId: lesson.organizationId,
        lessonId: lesson.id,
        studentId: payload.data.studentId as number,
        comment: '',
        status: 'UNSPECIFIED' as const,
      }))

      await tx.attendance.createMany({
        data: attendanceData,
        skipDuplicates: true,
      })
    }
  })

  revalidatePath(`/groups/${payload.data.groupId}`)
}

export const updateStudentGroup = async (
  payload: Prisma.StudentGroupUpdateArgs,
  isApplyToLessons: boolean,
) => {
  if (payload.data && 'groupId' in payload.data) {
    throw new Error(
      'Изменение groupId через updateStudentGroup запрещено. Используйте transferStudentToGroup.',
    )
  }

  await prisma.$transaction(async (tx) => {
    const oldStudentGroup = await tx.studentGroup.findUniqueOrThrow({
      where: payload.where,
      select: { groupId: true, studentId: true },
    })

    const sg = await tx.studentGroup.update(payload)

    if (!isApplyToLessons) return

    const isGroupChanged = oldStudentGroup.groupId !== sg.groupId

    // Удаляем посещаемость из старой группы при переводе
    if (isGroupChanged) {
      await tx.attendance.deleteMany({
        where: {
          studentId: sg.studentId,
          status: 'UNSPECIFIED',
          lesson: {
            groupId: oldStudentGroup.groupId,
          },
        },
      })
    }

    const today = normalizeDateOnly(moscowNow())
    // Создаём посещаемость в новой группе
    const newFutureLessons = await tx.lesson.findMany({
      where: {
        groupId: sg.groupId,
        date: { gte: today },
      },
      select: { id: true, organizationId: true },
    })

    if (newFutureLessons.length > 0) {
      const attendanceData = newFutureLessons.map((lesson) => ({
        organizationId: lesson.organizationId,
        lessonId: lesson.id,
        studentId: sg.studentId,
        comment: '',
        status: 'UNSPECIFIED' as const,
      }))

      await tx.attendance.createMany({
        data: attendanceData,
        skipDuplicates: true,
      })
    }

    if (isGroupChanged) {
      revalidatePath(`/groups/${oldStudentGroup.groupId}`)
    }
    revalidatePath(`/groups/${sg.groupId}`)
  })
}

export const deleteStudentGroup = async (payload: Prisma.StudentGroupDeleteArgs) => {
  await prisma.$transaction(async (tx) => {
    const studentGroup = await tx.studentGroup.delete(payload)

    const todayDate = normalizeDateOnly(moscowNow())

    const futureLessons = await tx.lesson.findMany({
      where: {
        groupId: studentGroup.groupId,
        date: { gte: todayDate },
      },
      select: { id: true, organizationId: true },
    })

    if (futureLessons.length > 0) {
      const lessonIds = futureLessons.map((l) => l.id)

      await tx.attendance.deleteMany({
        where: {
          studentId: studentGroup.studentId,
          lessonId: { in: lessonIds },
          status: 'UNSPECIFIED',
        },
      })
    }
    revalidatePath(`/groups/${studentGroup.groupId}`)
  })
}

export const dismissStudentFromGroup = async (payload: {
  studentId: number
  groupId: number
  dismissComment: string
  dismissedAt: Date
}) => {
  const { studentId, groupId, dismissComment, dismissedAt } = payload
  await prisma.$transaction(async (tx) => {
    await tx.studentGroup.update({
      where: { studentId_groupId: { studentId, groupId } },
      data: {
        status: 'DISMISSED',
        dismissComment,
        dismissedAt,
      },
    })

    const todayDate = normalizeDateOnly(moscowNow())

    const futureLessons = await tx.lesson.findMany({
      where: {
        groupId,
        date: { gte: todayDate },
      },
      select: { id: true },
    })

    if (futureLessons.length > 0) {
      await tx.attendance.deleteMany({
        where: {
          studentId,
          lessonId: { in: futureLessons.map((l) => l.id) },
          status: 'UNSPECIFIED',
        },
      })
    }
  })
  revalidatePath(`/groups/${groupId}`)
}

export const transferStudentToGroup = async (payload: {
  studentId: number
  oldGroupId: number
  newGroupId: number
  organizationId: number
  actorUserId: number
  transferBalance: boolean
}) => {
  const { studentId, oldGroupId, newGroupId, organizationId, actorUserId, transferBalance } =
    payload

  await prisma.$transaction(async (tx) => {
    // 1. Read old StudentGroup with all financial data
    const oldSg = await tx.studentGroup.findUniqueOrThrow({
      where: { studentId_groupId: { studentId, groupId: oldGroupId } },
    })

    // 2. Read new group info for the transfer comment
    const newGroup = await tx.group.findUniqueOrThrow({
      where: { id: newGroupId },
      include: { course: true, location: true, schedules: true },
    })
    const newGroupName = getGroupName(newGroup)

    // 3. Mark old StudentGroup as TRANSFERRED
    await tx.studentGroup.update({
      where: { studentId_groupId: { studentId, groupId: oldGroupId } },
      data: {
        status: 'TRANSFERRED',
        transferredAt: normalizeDateOnly(moscowNow()),
        transferComment: `Переведён в группу ${newGroupName}`,
      },
    })

    // 4. Handle new group enrollment
    const existingSg = await tx.studentGroup.findUnique({
      where: { studentId_groupId: { studentId, groupId: newGroupId } },
    })

    if (existingSg) {
      if (existingSg.status === 'ACTIVE' || existingSg.status === 'TRIAL') {
        throw new Error('Ученик уже в этой группе')
      }
      // Reactivate DISMISSED or TRANSFERRED record
      await tx.studentGroup.update({
        where: { studentId_groupId: { studentId, groupId: newGroupId } },
        data: {
          status: 'ACTIVE',
          dismissComment: null,
          dismissedAt: null,
          transferComment: null,
          transferredAt: null,
          lessonsBalance: 0,
          totalLessons: 0,
          totalPayments: 0,
        },
      })
    } else {
      await tx.studentGroup.create({
        data: {
          studentId,
          groupId: newGroupId,
          organizationId,
          status: 'ACTIVE',
        },
      })
    }

    // 5. Transfer balance if requested (with proportional financial fields)
    if (transferBalance && oldSg.lessonsBalance > 0) {
      const balanceDelta = oldSg.lessonsBalance

      // Calculate proportional totalLessons and totalPayments to transfer
      const totalLessonsDelta = balanceDelta
      const rate = oldSg.totalLessons > 0 ? Math.floor(oldSg.totalPayments / oldSg.totalLessons) : 0
      const totalPaymentsDelta = balanceDelta * rate

      // Decrement old group
      await tx.studentGroup.update({
        where: { studentId_groupId: { studentId, groupId: oldGroupId } },
        data: {
          lessonsBalance: { decrement: balanceDelta },
          totalLessons: { decrement: totalLessonsDelta },
          totalPayments: { decrement: totalPaymentsDelta },
        },
      })

      // Increment new group
      const updatedNewSg = await tx.studentGroup.update({
        where: { studentId_groupId: { studentId, groupId: newGroupId } },
        data: {
          lessonsBalance: { increment: balanceDelta },
          totalLessons: { increment: totalLessonsDelta },
          totalPayments: { increment: totalPaymentsDelta },
        },
        select: { lessonsBalance: true, totalLessons: true, totalPayments: true },
      })

      const transferComment = `Перенос при переводе в группу ${newGroupName}`
      const receiveComment = `Перенос при переводе из другой группы`

      // Audit trail — old group (3 fields)
      const oldGroupAudits = [
        {
          field: StudentFinancialField.LESSONS_BALANCE,
          delta: -balanceDelta,
          before: oldSg.lessonsBalance,
          after: oldSg.lessonsBalance - balanceDelta,
        },
        {
          field: StudentFinancialField.TOTAL_LESSONS,
          delta: -totalLessonsDelta,
          before: oldSg.totalLessons,
          after: oldSg.totalLessons - totalLessonsDelta,
        },
        {
          field: StudentFinancialField.TOTAL_PAYMENTS,
          delta: -totalPaymentsDelta,
          before: oldSg.totalPayments,
          after: oldSg.totalPayments - totalPaymentsDelta,
        },
      ]

      for (const a of oldGroupAudits) {
        await writeFinancialHistoryTx(tx, {
          organizationId,
          studentId,
          actorUserId,
          groupId: oldGroupId,
          field: a.field,
          reason: StudentLessonsBalanceChangeReason.BALANCE_REDISTRIBUTED,
          delta: a.delta,
          balanceBefore: a.before,
          balanceAfter: a.after,
          comment: transferComment,
        })
      }

      // Audit trail — new group (3 fields)
      const newGroupAudits = [
        {
          field: StudentFinancialField.LESSONS_BALANCE,
          delta: balanceDelta,
          before: updatedNewSg.lessonsBalance - balanceDelta,
          after: updatedNewSg.lessonsBalance,
        },
        {
          field: StudentFinancialField.TOTAL_LESSONS,
          delta: totalLessonsDelta,
          before: updatedNewSg.totalLessons - totalLessonsDelta,
          after: updatedNewSg.totalLessons,
        },
        {
          field: StudentFinancialField.TOTAL_PAYMENTS,
          delta: totalPaymentsDelta,
          before: updatedNewSg.totalPayments - totalPaymentsDelta,
          after: updatedNewSg.totalPayments,
        },
      ]

      for (const a of newGroupAudits) {
        await writeFinancialHistoryTx(tx, {
          organizationId,
          studentId,
          actorUserId,
          groupId: newGroupId,
          field: a.field,
          reason: StudentLessonsBalanceChangeReason.BALANCE_REDISTRIBUTED,
          delta: a.delta,
          balanceBefore: a.before,
          balanceAfter: a.after,
          comment: receiveComment,
        })
      }
    }

    // 6. Remove UNSPECIFIED attendance from old group
    await tx.attendance.deleteMany({
      where: {
        studentId,
        status: 'UNSPECIFIED',
        lesson: { groupId: oldGroupId },
      },
    })

    // 7. Create UNSPECIFIED attendance for future lessons in new group
    const today = normalizeDateOnly(moscowNow())
    const newFutureLessons = await tx.lesson.findMany({
      where: {
        groupId: newGroupId,
        date: { gte: today },
      },
      select: { id: true, organizationId: true },
    })

    if (newFutureLessons.length > 0) {
      await tx.attendance.createMany({
        data: newFutureLessons.map((lesson) => ({
          organizationId: lesson.organizationId,
          lessonId: lesson.id,
          studentId,
          comment: '',
          status: 'UNSPECIFIED' as const,
        })),
        skipDuplicates: true,
      })
    }
  })

  revalidatePath(`/groups/${oldGroupId}`)
  revalidatePath(`/groups/${newGroupId}`)
}

export const updateTeacherGroup = async (
  payload: Prisma.TeacherGroupUpdateArgs,
  isApplyToLessons: boolean,
) => {
  await prisma.$transaction(async (tx) => {
    const teacherGroup = await tx.teacherGroup.update({
      ...payload,
      include: { rate: true },
    })

    if (isApplyToLessons) {
      await tx.teacherLesson.updateMany({
        where: {
          teacherId: teacherGroup.teacherId,
          lesson: {
            date: { gt: normalizeDateOnly(moscowNow()) },
            groupId: teacherGroup.groupId,
          },
        },
        data: {
          bid: teacherGroup.rate.bid,
          bonusPerStudent: teacherGroup.rate.bonusPerStudent,
        },
      })
    }
  })

  revalidatePath(`/groups/${payload.data.groupId}`)
}

export const createTeacherGroup = async (
  payload: Prisma.TeacherGroupCreateArgs,
  isApplyToLessons: boolean,
) => {
  await prisma.$transaction(async (tx) => {
    const teacherGroup = await tx.teacherGroup.create({
      ...payload,
      include: {
        rate: true,
        group: {
          include: {
            lessons: {
              where: {
                date: { gt: normalizeDateOnly(moscowNow()) },
                teachers: { none: { teacherId: payload.data.teacherId } },
              },
            },
          },
        },
      },
    })
    if (isApplyToLessons) {
      for (const lesson of teacherGroup.group.lessons) {
        await tx.teacherLesson.create({
          data: {
            organizationId: lesson.organizationId,
            lessonId: lesson.id,
            teacherId: payload.data.teacherId as number,
            bid: teacherGroup.rate.bid,
            bonusPerStudent: teacherGroup.rate.bonusPerStudent,
          },
        })
      }
    }
  })
  revalidatePath(`/groups/${payload.data.groupId}`)
}

export const deleteTeacherGroup = async (
  payload: Prisma.TeacherGroupDeleteArgs,
  isApplyToLessons: boolean,
) => {
  await prisma.$transaction(async (tx) => {
    const teacherGroup = await tx.teacherGroup.delete({
      ...payload,
      include: {
        group: true,
      },
    })
    if (isApplyToLessons) {
      await tx.teacherLesson.deleteMany({
        where: {
          teacherId: teacherGroup.teacherId,
          lesson: {
            date: { gt: normalizeDateOnly(moscowNow()) },
            groupId: teacherGroup.groupId,
          },
        },
      })
    }
  })
  revalidatePath(`/groups/${payload.where.groupId}`)
}
