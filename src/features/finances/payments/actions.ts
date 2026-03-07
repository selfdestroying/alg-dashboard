'use server'

import { StudentFinancialField, StudentLessonsBalanceChangeReason } from '@/prisma/generated/enums'
import prisma from '@/src/lib/db/prisma'
import { writeFinancialHistoryTx } from '@/src/lib/lessons-balance'
import { authAction } from '@/src/lib/safe-action'
import {
  CancelPaymentSchema,
  CreatePaymentSchema,
  DeleteUnprocessedPaymentSchema,
  ResolveUnprocessedPaymentSchema,
} from './schemas'

export const getPayments = authAction
  .metadata({ actionName: 'getPayments' })
  .action(async ({ ctx }) => {
    return await prisma.payment.findMany({
      where: { organizationId: ctx.session.organizationId! },
      include: {
        student: true,
        group: { include: { course: true, location: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  })

export const getStudentsForPayments = authAction
  .metadata({ actionName: 'getStudentsForPayments' })
  .action(async ({ ctx }) => {
    return await prisma.student.findMany({
      where: { organizationId: ctx.session.organizationId! },
      orderBy: { id: 'asc' },
      include: {
        groups: {
          include: {
            group: { include: { course: true, location: true, schedules: true } },
          },
        },
      },
    })
  })

export const createPaymentWithBalance = authAction
  .metadata({ actionName: 'createPaymentWithBalance' })
  .inputSchema(CreatePaymentSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { student, group, lessonCount, price, leadName, productName } = parsedInput
    const studentId = student.value
    const groupId = group.value

    const paymentMeta = { lessonCount, price, leadName, productName, groupId }

    await prisma.$transaction(async (tx) => {
      const sg = await tx.studentGroup.findUnique({
        where: { studentId_groupId: { studentId, groupId } },
        select: {
          lessonsBalance: true,
          totalPayments: true,
          totalLessons: true,
          organizationId: true,
        },
      })
      if (!sg) throw new Error('Ученик не найден в группе')

      await tx.payment.create({
        data: {
          organizationId: sg.organizationId,
          studentId,
          groupId,
          lessonCount,
          price,
          bidForLesson: Math.floor(price / lessonCount),
          leadName,
          productName,
        },
      })

      const updated = await tx.studentGroup.update({
        where: { studentId_groupId: { studentId, groupId } },
        data: {
          lessonsBalance: { increment: lessonCount },
          totalLessons: { increment: lessonCount },
          totalPayments: { increment: price },
        },
        select: { lessonsBalance: true, totalPayments: true, totalLessons: true },
      })

      const fields = [
        {
          field: StudentFinancialField.LESSONS_BALANCE,
          key: 'lessonsBalance' as const,
        },
        {
          field: StudentFinancialField.TOTAL_PAYMENTS,
          key: 'totalPayments' as const,
        },
        {
          field: StudentFinancialField.TOTAL_LESSONS,
          key: 'totalLessons' as const,
        },
      ]

      for (const f of fields) {
        await writeFinancialHistoryTx(tx, {
          organizationId: ctx.session.organizationId!,
          studentId,
          actorUserId: Number(ctx.session.user.id),
          groupId,
          field: f.field,
          reason: StudentLessonsBalanceChangeReason.PAYMENT_CREATED,
          delta: updated[f.key] - sg[f.key],
          balanceBefore: sg[f.key],
          balanceAfter: updated[f.key],
          meta: paymentMeta,
        })
      }
    })
  })

export const cancelPayment = authAction
  .metadata({ actionName: 'cancelPayment' })
  .inputSchema(CancelPaymentSchema)
  .action(async ({ ctx, parsedInput }) => {
    await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.delete({
        where: { id: parsedInput.id, organizationId: ctx.session.organizationId! },
      })

      // Determine where to decrement: per-group or global (legacy)
      const hasGroup = payment.groupId != null
      let balancesBefore: { lessonsBalance: number; totalPayments: number; totalLessons: number }
      let balancesAfter: { lessonsBalance: number; totalPayments: number; totalLessons: number }

      if (hasGroup) {
        const sg = await tx.studentGroup.findUnique({
          where: {
            studentId_groupId: { studentId: payment.studentId, groupId: payment.groupId! },
          },
          select: { lessonsBalance: true, totalPayments: true, totalLessons: true },
        })
        if (!sg) throw new Error('Ученик не найден в группе')

        balancesBefore = sg

        const updatedSg = await tx.studentGroup.update({
          where: {
            studentId_groupId: { studentId: payment.studentId, groupId: payment.groupId! },
          },
          data: {
            totalLessons: { decrement: payment.lessonCount },
            totalPayments: { decrement: payment.price },
            lessonsBalance: { decrement: payment.lessonCount },
          },
          select: { lessonsBalance: true, totalPayments: true, totalLessons: true },
        })

        balancesAfter = updatedSg
      } else {
        // Legacy payments without groupId — decrement global student balance
        const student = await tx.student.findUnique({
          where: { id: payment.studentId },
          select: { lessonsBalance: true, totalPayments: true, totalLessons: true },
        })
        if (!student) throw new Error('Ученик не найден')

        balancesBefore = student

        const updated = await tx.student.update({
          where: { id: payment.studentId },
          data: {
            totalLessons: { decrement: payment.lessonCount },
            totalPayments: { decrement: payment.price },
            lessonsBalance: { decrement: payment.lessonCount },
          },
          select: { lessonsBalance: true, totalPayments: true, totalLessons: true },
        })

        balancesAfter = updated
      }

      const commonMeta = {
        paymentId: payment.id,
        lessonCount: payment.lessonCount,
        price: payment.price,
        groupId: payment.groupId,
      }

      const fields = [
        {
          field: StudentFinancialField.LESSONS_BALANCE,
          key: 'lessonsBalance' as const,
        },
        {
          field: StudentFinancialField.TOTAL_PAYMENTS,
          key: 'totalPayments' as const,
        },
        {
          field: StudentFinancialField.TOTAL_LESSONS,
          key: 'totalLessons' as const,
        },
      ]

      for (const f of fields) {
        const before = balancesBefore[f.key]
        const after = balancesAfter[f.key]
        await writeFinancialHistoryTx(tx, {
          organizationId: ctx.session.organizationId!,
          studentId: payment.studentId,
          actorUserId: Number(ctx.session.user.id),
          groupId: payment.groupId,
          field: f.field,
          reason: StudentLessonsBalanceChangeReason.PAYMENT_CANCELLED,
          delta: after - before,
          balanceBefore: before,
          balanceAfter: after,
          meta: commonMeta,
        })
      }
    })
  })

export const getUnprocessedPayments = authAction
  .metadata({ actionName: 'getUnprocessedPayments' })
  .action(async ({ ctx }) => {
    return await prisma.unprocessedPayment.findMany({
      where: { organizationId: ctx.session.organizationId! },
      orderBy: { createdAt: 'desc' },
    })
  })

export const resolveUnprocessedPayment = authAction
  .metadata({ actionName: 'resolveUnprocessedPayment' })
  .inputSchema(ResolveUnprocessedPaymentSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { unprocessedPaymentId, student, group, lessonCount, price, leadName, productName } =
      parsedInput
    const studentId = student.value
    const groupId = group.value

    const paymentMeta = {
      lessonCount,
      price,
      leadName,
      productName,
      groupId,
      unprocessedPaymentId,
    }

    await prisma.$transaction(async (tx) => {
      const sg = await tx.studentGroup.findUnique({
        where: { studentId_groupId: { studentId, groupId } },
        select: {
          lessonsBalance: true,
          totalPayments: true,
          totalLessons: true,
          organizationId: true,
        },
      })
      if (!sg) throw new Error('Ученик не найден в группе')

      await tx.payment.create({
        data: {
          organizationId: sg.organizationId,
          studentId,
          groupId,
          lessonCount,
          price,
          bidForLesson: Math.floor(price / lessonCount),
          leadName,
          productName,
        },
      })

      const updated = await tx.studentGroup.update({
        where: { studentId_groupId: { studentId, groupId } },
        data: {
          lessonsBalance: { increment: lessonCount },
          totalLessons: { increment: lessonCount },
          totalPayments: { increment: price },
        },
        select: { lessonsBalance: true, totalPayments: true, totalLessons: true },
      })

      await tx.unprocessedPayment.update({
        where: { id: unprocessedPaymentId, organizationId: ctx.session.organizationId! },
        data: { resolved: true },
      })

      const fields = [
        {
          field: StudentFinancialField.LESSONS_BALANCE,
          key: 'lessonsBalance' as const,
        },
        {
          field: StudentFinancialField.TOTAL_PAYMENTS,
          key: 'totalPayments' as const,
        },
        {
          field: StudentFinancialField.TOTAL_LESSONS,
          key: 'totalLessons' as const,
        },
      ]

      for (const f of fields) {
        await writeFinancialHistoryTx(tx, {
          organizationId: ctx.session.organizationId!,
          studentId,
          actorUserId: Number(ctx.session.user.id),
          groupId,
          field: f.field,
          reason: StudentLessonsBalanceChangeReason.PAYMENT_CREATED,
          delta: updated[f.key] - sg[f.key],
          balanceBefore: sg[f.key],
          balanceAfter: updated[f.key],
          meta: paymentMeta,
        })
      }
    })
  })

export const deleteUnprocessedPayment = authAction
  .metadata({ actionName: 'deleteUnprocessedPayment' })
  .inputSchema(DeleteUnprocessedPaymentSchema)
  .action(async ({ ctx, parsedInput }) => {
    await prisma.unprocessedPayment.delete({
      where: { id: parsedInput.id, organizationId: ctx.session.organizationId! },
    })
  })
