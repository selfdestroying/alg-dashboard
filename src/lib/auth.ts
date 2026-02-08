import { betterAuth } from 'better-auth'
import { localization } from 'better-auth-localization'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { nextCookies } from 'better-auth/next-js'
import { admin as adminPlugin, customSession, organization } from 'better-auth/plugins'
import {
  manager,
  ac as orgAc,
  owner as orgOwner,
  teacher,
} from '../shared/organization-permeissions'
import { ac, admin, owner, user } from '../shared/permissions'
import prisma from './prisma'

export type Session = typeof auth.$Infer.Session
export type ActiveOrganization = typeof auth.$Infer.ActiveOrganization
export type OrganizationRole = ActiveOrganization['members'][number]['role']
export type Members = ActiveOrganization['members']

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  user: {
    modelName: 'User',
    additionalFields: {
      firstName: { type: 'string', required: true },
      lastName: { type: 'string', required: true },
      bidForLesson: { type: 'number', required: true },
      bidForIndividual: { type: 'number', required: true },
    },
  },
  session: {
    modelName: 'Session',
  },
  account: {
    modelName: 'Account',
  },
  verification: {
    modelName: 'Verification',
  },
  emailAndPassword: {
    enabled: true,
    // requireEmailVerification: true,
  },
  rateLimit: {
    enabled: true,
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const member = await prisma.member.findFirst({
            where: { userId: Number(session.userId) },
          })

          return {
            data: {
              ...session,
              activeOrganizationId: member?.organizationId.toString() ?? null,
            },
          }
        },
      },
    },
  },
  advanced: {
    useSecureCookies: false,
    crossSubDomainCookies: {
      enabled: true,
      domain: '.alg.test',
    },
    cookiePrefix: 'alg',
    database: {
      generateId: 'serial',
    },
  },
  trustedOrigins: (request) => {
    // Разрешаем все поддомены alg.test
    if (!request) return []
    const origin = request.headers.get('origin')
    if (!origin) return []
    try {
      const url = new URL(origin)
      if (url.hostname.endsWith('.alg.test') || url.hostname === 'alg.test') {
        return [origin]
      }
    } catch {
      // Невалидный URL
    }
    return []
  },
  plugins: [
    localization({
      defaultLocale: 'ru-RU',
      fallbackLocale: 'default',
    }),
    customSession(async ({ user, session }) => {
      const members = await prisma.member.findMany({
        where: { userId: Number(session.userId) },
        include: {
          organization: true,
        },
      })

      const roles =
        (
          await prisma.user.findFirst({
            where: { id: Number(session.userId) },
            select: { role: true },
          })
        )?.role?.split(',') || []

      return {
        user,
        roles,
        members,
        session,
      }
    }),
    nextCookies(),
    adminPlugin({
      ac,
      roles: {
        admin,
        owner,
        user,
      },
    }),
    organization({
      allowUserToCreateOrganization: true,
      ac: orgAc,
      roles: {
        owner: orgOwner,
        manager,
        teacher,
      },
      schema: {
        member: { modelName: 'Member' },
        organization: { modelName: 'Organization' },
        invitation: { modelName: 'Invitation' },
      },
    }),
  ],
})
