'use server'

import prisma from '@/src/lib/db/prisma'
import { authAction } from '@/src/lib/safe-action'
import { ChangeOrderStatusSchema } from './schemas'

export const getOrders = authAction
  .metadata({ actionName: 'getOrders' })
  .action(async ({ ctx }) => {
    return await prisma.order.findMany({
      where: {
        organizationId: ctx.session.organizationId!,
      },
      include: { product: true, student: true },
      orderBy: { createdAt: 'desc' },
    })
  })

export const changeOrderStatus = authAction
  .metadata({ actionName: 'changeOrderStatus' })
  .inputSchema(ChangeOrderStatusSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { id, newStatus } = parsedInput

    const order = await prisma.order.findUniqueOrThrow({
      where: { id, organizationId: ctx.session.organizationId! },
      include: { product: true },
    })

    await prisma.order.update({
      where: { id, organizationId: ctx.session.organizationId! },
      data: { status: newStatus },
    })

    if ((order.status === 'PENDING' || order.status === 'COMPLETED') && newStatus === 'CANCELLED') {
      await prisma.student.update({
        where: { id: order.studentId },
        data: { coins: { increment: order.product.price } },
      })
    } else if (
      order.status === 'CANCELLED' &&
      (newStatus === 'COMPLETED' || newStatus === 'PENDING')
    ) {
      await prisma.student.update({
        where: { id: order.studentId },
        data: { coins: { decrement: order.product.price } },
      })
    }
  })
