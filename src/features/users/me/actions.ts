'use server'

import { auth } from '@/src/lib/auth/server'
import prisma from '@/src/lib/db/prisma'
import { authAction } from '@/src/lib/safe-action'
import { headers } from 'next/headers'

export const getActiveSessions = authAction
  .metadata({ actionName: 'getActiveSessions' })
  .action(async () => {
    return await auth.api.listSessions({
      headers: await headers(),
    })
  })

export const getMyPaychecks = authAction
  .metadata({ actionName: 'getMyPaychecks' })
  .action(async ({ ctx }) => {
    return await prisma.payCheck.findMany({
      where: {
        userId: Number(ctx.session.user.id),
        organizationId: ctx.session.organizationId!,
      },
    })
  })
