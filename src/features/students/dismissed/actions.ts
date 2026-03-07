'use server'

import prisma from '@/src/lib/db/prisma'
import { authAction } from '@/src/lib/safe-action'
import { moscowNow, normalizeDateOnly } from '@/src/lib/timezone'
import { DeleteDismissedSchema, ReturnToGroupSchema } from './schemas'

// ─── READ ────────────────────────────────────────────────────────────────────

export const getDismissedStudents = authAction
  .metadata({ actionName: 'getDismissedStudents' })
  .action(async ({ ctx }) => {
    return await prisma.studentGroup.findMany({
      where: {
        organizationId: ctx.session.organizationId!,
        status: 'DISMISSED',
      },
      include: {
        group: {
          include: {
            course: true,
            location: true,
            schedules: true,
            teachers: { include: { teacher: { include: { members: true } } } },
          },
        },
        student: true,
      },
      orderBy: { dismissedAt: 'desc' },
    })
  })

// ─── MUTATIONS ───────────────────────────────────────────────────────────────

export const removeDismissed = authAction
  .metadata({ actionName: 'removeDismissed' })
  .inputSchema(DeleteDismissedSchema)
  .action(async ({ ctx, parsedInput }) => {
    await prisma.studentGroup.delete({
      where: {
        studentId_groupId: {
          studentId: parsedInput.studentId,
          groupId: parsedInput.groupId,
        },
        organizationId: ctx.session.organizationId!,
      },
    })
  })

export const returnToGroup = authAction
  .metadata({ actionName: 'returnToGroup' })
  .inputSchema(ReturnToGroupSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { groupId, studentId } = parsedInput
    const organizationId = ctx.session.organizationId!

    await prisma.$transaction(async (tx) => {
      const lastAttendance = await tx.attendance.findFirst({
        where: {
          studentId,
          lesson: { groupId },
        },
        include: { lesson: true },
        orderBy: { lesson: { date: 'desc' } },
      })

      await tx.studentGroup.update({
        where: { studentId_groupId: { studentId, groupId } },
        data: {
          status: 'ACTIVE',
          dismissComment: null,
          dismissedAt: null,
        },
      })

      if (lastAttendance) {
        const lessons = await tx.lesson.findMany({
          where: {
            organizationId,
            groupId,
            date: { gt: lastAttendance.lesson.date },
          },
        })
        if (lessons.length > 0) {
          await tx.attendance.createMany({
            data: lessons.map((lesson) => ({
              organizationId: lesson.organizationId,
              lessonId: lesson.id,
              studentId,
              status: 'UNSPECIFIED' as const,
              comment: '',
            })),
            skipDuplicates: true,
          })
        }
      } else {
        const todayDate = normalizeDateOnly(moscowNow())
        const futureLessons = await tx.lesson.findMany({
          where: {
            organizationId,
            groupId,
            date: { gte: todayDate },
          },
        })
        if (futureLessons.length > 0) {
          await tx.attendance.createMany({
            data: futureLessons.map((lesson) => ({
              organizationId: lesson.organizationId,
              lessonId: lesson.id,
              studentId,
              status: 'UNSPECIFIED' as const,
              comment: '',
            })),
            skipDuplicates: true,
          })
        }
      }
    })
  })
