'use server'

import prisma from '@/src/lib/db/prisma'
import { authAction } from '@/src/lib/safe-action'

// ─── READ ────────────────────────────────────────────────────────────────────

export const getAbsentAttendances = authAction
  .metadata({ actionName: 'getAbsentAttendances' })
  .action(async ({ ctx }) => {
    return await prisma.attendance.findMany({
      where: {
        organizationId: ctx.session.organizationId!,
        status: 'ABSENT',
        OR: [
          {
            AND: [{ missedMakeup: { is: null } }, { asMakeupFor: { is: null } }],
          },
          { asMakeupFor: { isNot: null } },
        ],
        studentStatus: { in: ['ACTIVE', 'TRIAL'] },
      },
      include: {
        student: true,
        lesson: {
          include: {
            group: {
              include: {
                course: true,
                location: true,
                schedules: true,
                teachers: {
                  include: {
                    teacher: true,
                  },
                },
              },
            },
          },
        },
        asMakeupFor: { include: { missedAttendance: { include: { lesson: true } } } },
        missedMakeup: { include: { makeUpAttendance: { include: { lesson: true } } } },
      },
      orderBy: [{ lesson: { date: 'desc' } }],
    })
  })
