import 'server-only'

import { verifySession } from '@/lib/session'
import { Prisma, StudentLessonsBalanceChangeReason } from '@prisma/client'

export type LessonsBalanceAudit = {
  reason: StudentLessonsBalanceChangeReason
  comment?: string
  meta?: Prisma.JsonValue
}

type LessonsBalanceChange = { kind: 'delta'; delta: number } | { kind: 'set'; value: number }

export function parseLessonsBalanceChange(
  lessonsBalance: Prisma.StudentUpdateInput['lessonsBalance']
): LessonsBalanceChange | null {
  if (lessonsBalance === undefined) return null

  if (typeof lessonsBalance === 'number') {
    return { kind: 'set', value: lessonsBalance }
  }

  if (lessonsBalance && typeof lessonsBalance === 'object') {
    const ops = lessonsBalance as Prisma.IntFieldUpdateOperationsInput

    if (typeof ops.increment === 'number') return { kind: 'delta', delta: ops.increment }
    if (typeof ops.decrement === 'number') return { kind: 'delta', delta: -ops.decrement }
    if (typeof ops.set === 'number') return { kind: 'set', value: ops.set }
  }

  return null
}

export async function requireActorUserId() {
  const session = await verifySession()
  if (!session.isAuth || !session.userId) {
    throw new Error('Требуется авторизация')
  }
  return session.userId
}

export async function writeLessonsBalanceHistoryTx(
  tx: Prisma.TransactionClient,
  args: {
    studentId: number
    actorUserId: number
    reason: StudentLessonsBalanceChangeReason
    delta: number
    balanceBefore: number
    balanceAfter: number
    comment?: string
    meta?: Prisma.JsonValue
  }
) {
  if (args.delta === 0) return

  await tx.studentLessonsBalanceHistory.create({
    data: {
      studentId: args.studentId,
      actorUserId: args.actorUserId,
      reason: args.reason,
      delta: args.delta,
      balanceBefore: args.balanceBefore,
      balanceAfter: args.balanceAfter,
      comment: args.comment,
      meta: args.meta as Prisma.InputJsonValue,
    },
  })
}
