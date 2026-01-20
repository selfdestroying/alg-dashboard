'use server'

import { prisma } from '@/lib/prisma'
import { OrderStatus, Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export type OrderWithProductAndStudent = Prisma.OrderGetPayload<{
  include: { product: true; student: true }
}>

export const getOrders = async () => {
  const orders = await prisma.order.findMany({
    include: { product: true, student: true },
  })
  return orders
}

export const updateOrder = async (order: OrderWithProductAndStudent, newStatus: OrderStatus) => {
  await prisma.order.update({ where: { id: order.id }, data: { status: newStatus } })
  if ((order.status == 'PENDING' || order.status == 'COMPLETED') && newStatus == 'CANCELLED') {
    await prisma.student.update({
      where: { id: order.studentId },
      data: { coins: { increment: order.product.price } },
    })
  } else if (order.status == 'CANCELLED' && newStatus == 'COMPLETED') {
    await prisma.student.update({
      where: { id: order.studentId },
      data: { coins: { decrement: order.product.price } },
    })
  }
  revalidatePath('dashboard/orders')
}
