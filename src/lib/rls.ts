/**
 * Row Level Security (RLS) — хелперы для multi-tenant изоляции.
 *
 * PostgreSQL RLS-политики фильтруют данные по organizationId.
 * Для активации RLS транзакция переключается на роль app_user
 * и устанавливает параметр app.organization_id.
 *
 * Использование:
 *   // Вариант 1: с известным organizationId
 *   await withRLS(orgId, (tx) => tx.student.findMany())
 *
 *   // Вариант 2: organizationId из сессии автоматически
 *   await withSessionRLS((tx, orgId) => tx.student.findMany())
 *
 *   // Вариант 3: RLS внутри существующей транзакции
 *   await prisma.$transaction(async (tx) => {
 *     await enableRLS(tx, orgId)
 *     await tx.student.findMany()
 *   })
 */

import 'server-only'

import { Prisma } from '@/prisma/generated/client'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from './auth'
import prisma from './prisma'
import { protocol, rootDomain } from './utils'

/** Тип Prisma-клиента внутри транзакции */
export type TransactionClient = Prisma.TransactionClient

/**
 * Активировать RLS внутри уже открытой транзакции.
 * Используйте, когда у вас уже есть `prisma.$transaction(...)`.
 */
export async function enableRLS(tx: TransactionClient, organizationId: number): Promise<void> {
  await tx.$executeRaw`SELECT set_config('app.organization_id', ${organizationId.toString()}, true)`
  await tx.$executeRaw`SET LOCAL ROLE app_user`
}

/**
 * Выполнить callback в транзакции с активированным RLS.
 * PostgreSQL гарантирует, что доступны только строки с указанным organizationId.
 */
export async function withRLS<T>(
  organizationId: number,
  fn: (tx: TransactionClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await enableRLS(tx, organizationId)
    return fn(tx)
  })
}

/**
 * Получить organizationId текущего пользователя из серверной сессии.
 * Редиректит на /sign-in если нет сессии.
 * @throws Error если нет активной организации.
 */
export async function getSessionOrganizationId(): Promise<number> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect(`${protocol}://auth.${rootDomain}/sign-in`)
  }

  const orgId =
    session.session.activeOrganizationId != null
      ? parseInt(session.session.activeOrganizationId)
      : session.members[0]?.organizationId

  if (!orgId || isNaN(orgId)) {
    throw new Error('No active organization')
  }

  return orgId
}

/**
 * Выполнить callback в транзакции с RLS, автоматически получая
 * organizationId из серверной сессии.
 *
 * Объединяет проверку авторизации и активацию RLS в одном вызове.
 */
export async function withSessionRLS<T>(
  fn: (tx: TransactionClient, organizationId: number) => Promise<T>
): Promise<T> {
  const organizationId = await getSessionOrganizationId()
  return withRLS(organizationId, (tx) => fn(tx, organizationId))
}
