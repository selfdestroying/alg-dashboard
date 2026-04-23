'use server'

import prisma from '@/src/lib/db/prisma'
import { authAction } from '@/src/lib/safe-action'
import { addDays } from 'date-fns'
import { CreateRentSchema, DeleteRentSchema, UpdateRentSchema } from './schemas'

type PeriodInput = {
  isMonthly: boolean
  startDate?: string
  endDate?: string
  month?: number
  year?: number
}

function resolvePeriod(input: PeriodInput): { startDate: Date; endDate: Date | null } {
  if (input.isMonthly) {
    const year = input.year!
    const month = input.month!
    return {
      // Start of contract: first day of chosen month/year
      startDate: new Date(Date.UTC(year, month, 1)),
      // Monthly recurring: open-ended
      endDate: null,
    }
  }
  return {
    startDate: new Date(input.startDate!),
    endDate: new Date(input.endDate!),
  }
}

export const getRents = authAction.metadata({ actionName: 'getRents' }).action(async ({ ctx }) => {
  return await prisma.rent.findMany({
    where: {
      organizationId: ctx.session.organizationId!,
    },
    include: { location: true },
    orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
  })
})

export const createRent = authAction
  .metadata({ actionName: 'createRent' })
  .inputSchema(CreateRentSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { startDate, endDate } = resolvePeriod(parsedInput)
    await prisma.$transaction(async (tx) => {
      // Auto-close previous open-ended rows that start before this one
      if (!endDate) {
        await tx.rent.updateMany({
          where: {
            organizationId: ctx.session.organizationId!,
            locationId: parsedInput.locationId,
            endDate: null,
            startDate: { lt: startDate },
          },
          data: { endDate: addDays(startDate, -1) },
        })
      }
      await tx.rent.create({
        data: {
          locationId: parsedInput.locationId,
          amount: parsedInput.amount,
          comment: parsedInput.comment,
          isMonthly: parsedInput.isMonthly,
          startDate,
          endDate,
          organizationId: ctx.session.organizationId!,
        },
      })
    })
  })

export const updateRent = authAction
  .metadata({ actionName: 'updateRent' })
  .inputSchema(UpdateRentSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { id, locationId, amount, comment, isMonthly } = parsedInput
    const { startDate, endDate } = resolvePeriod(parsedInput)
    await prisma.rent.update({
      where: { id, organizationId: ctx.session.organizationId! },
      data: {
        locationId,
        amount,
        comment,
        isMonthly,
        startDate,
        endDate,
      },
    })
  })

export const deleteRent = authAction
  .metadata({ actionName: 'deleteRent' })
  .inputSchema(DeleteRentSchema)
  .action(async ({ ctx, parsedInput }) => {
    await prisma.rent.delete({
      where: { id: parsedInput.id, organizationId: ctx.session.organizationId! },
    })
  })
