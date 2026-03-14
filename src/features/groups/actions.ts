'use server'
import prisma from '@/src/lib/db/prisma'
import { authAction } from '@/src/lib/safe-action'

export const getGroups = authAction
  .metadata({ actionName: 'getGroups' })
  .action(async ({ ctx }) => {
    return await prisma.group.findMany({
      where: { organizationId: ctx.session.organizationId! },
      include: {
        groupType: {
          include: {
            rate: true,
          },
        },
        location: true,
        course: true,
        schedules: true,
        teachers: {
          include: {
            teacher: true,
          },
        },
        students: {
          include: {
            student: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    })
  })
