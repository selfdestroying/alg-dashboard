'use server'

import prisma from '@/src/lib/db/prisma'
import { authAction } from '@/src/lib/safe-action'
import { RevenueFiltersSchema } from './schemas'

export const getRevenueLessons = authAction
  .metadata({ actionName: 'getRevenueLessons' })
  .inputSchema(RevenueFiltersSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { startDate, endDate, courseIds, locationIds, teacherIds } = parsedInput
    const organizationId = ctx.session.organizationId!

    const groupFilter: Record<string, object> = {}
    if (courseIds && courseIds.length > 0) {
      groupFilter.courseId = { in: courseIds }
    }
    if (locationIds && locationIds.length > 0) {
      groupFilter.locationId = { in: locationIds }
    }

    const teacherFilter =
      teacherIds && teacherIds.length > 0 ? { some: { teacherId: { in: teacherIds } } } : undefined

    return await prisma.lesson.findMany({
      where: {
        organizationId,
        date: { gte: startDate, lte: endDate },
        group: Object.keys(groupFilter).length > 0 ? groupFilter : undefined,
        teachers: teacherFilter,
      },
      include: {
        attendance: {
          include: {
            student: {
              include: {
                groups: { include: { wallet: true } },
              },
            },
          },
        },
        group: { include: { course: true, location: true, groupType: true, schedules: true } },
        teachers: { include: { teacher: true } },
      },
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
    })
  })
