'use server'
import prisma from '@/src/lib/db/prisma'
import { authAction } from '@/src/lib/safe-action'
import { moscowNow, normalizeDateOnly } from '@/src/lib/timezone'
import { ArchiveGroupSchema } from '@/src/schemas/group'
import * as z from 'zod'

export const getGroups = authAction
  .metadata({ actionName: 'getGroups' })
  .action(async ({ ctx }) => {
    return await prisma.group.findMany({
      where: { organizationId: ctx.session.organizationId!, isArchived: false },
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

export const archiveGroup = authAction
  .metadata({ actionName: 'archiveGroup' })
  .inputSchema(ArchiveGroupSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { groupId, archivedAt, comment, deleteFutureLessons } = parsedInput
    const archivedAtDate = new Date(
      archivedAt ?? normalizeDateOnly(moscowNow()).toISOString().split('T')[0]!,
    )
    await prisma.$transaction(async (tx) => {
      await tx.group.update({
        where: { id: groupId, organizationId: ctx.session.organizationId! },
        data: {
          isArchived: true,
          archivedAt: archivedAtDate,
          archiveComment: comment ?? null,
        },
      })

      if (deleteFutureLessons) {
        await tx.lesson.deleteMany({
          where: {
            groupId,
            date: { gte: archivedAtDate },
          },
        })
      }
    })
  })

export const countFutureLessons = authAction
  .metadata({ actionName: 'countFutureLessons' })
  .inputSchema(
    z.object({
      groupId: z.number().int().positive(),
      afterDate: z.string().optional(),
    }),
  )
  .action(async ({ ctx, parsedInput }) => {
    const afterDate = new Date(
      parsedInput.afterDate ?? normalizeDateOnly(moscowNow()).toISOString().split('T')[0]!,
    )

    return await prisma.lesson.count({
      where: {
        groupId: parsedInput.groupId,
        date: { gte: afterDate },
        group: { organizationId: ctx.session.organizationId! },
      },
    })
  })
