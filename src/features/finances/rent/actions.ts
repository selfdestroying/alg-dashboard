'use server'

import prisma from '@/src/lib/db/prisma'
import { authAction } from '@/src/lib/safe-action'
import { CreateRentSchema, DeleteRentSchema, UpdateRentSchema } from './schemas'

export const getRents = authAction.metadata({ actionName: 'getRents' }).action(async ({ ctx }) => {
  return await prisma.rent.findMany({
    where: {
      organizationId: ctx.session.organizationId!,
    },
    include: { location: true },
    orderBy: { startDate: 'desc' },
  })
})

export const createRent = authAction
  .metadata({ actionName: 'createRent' })
  .inputSchema(CreateRentSchema)
  .action(async ({ ctx, parsedInput }) => {
    await prisma.rent.create({
      data: {
        ...parsedInput,
        startDate: new Date(parsedInput.startDate),
        endDate: new Date(parsedInput.endDate),
        organizationId: ctx.session.organizationId!,
      },
    })
  })

export const updateRent = authAction
  .metadata({ actionName: 'updateRent' })
  .inputSchema(UpdateRentSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { id, ...data } = parsedInput
    await prisma.rent.update({
      where: { id, organizationId: ctx.session.organizationId! },
      data,
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
