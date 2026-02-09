import { betterAuth, type BetterAuthOptions } from 'better-auth'
import { localization } from 'better-auth-localization'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { nextCookies } from 'better-auth/next-js'
import { admin as adminPlugin, customSession, organization } from 'better-auth/plugins'
import {
  manager,
  ac as orgAc,
  owner as orgOwner,
  teacher,
} from '../shared/organization-permissions'
import { ac, admin, owner, user } from '../shared/permissions'
import prisma from './prisma'

const ROOT_DOMAIN = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'alg.test:3000').split(':')[0]

const options = {
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
    disableSignUp: true,
  },
  rateLimit: {
    enabled: true,
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const userId = Number(session.userId)
          const member = await prisma.member.findFirst({
            where: { userId },
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
    useSecureCookies: process.env.NODE_ENV === 'production',
    crossSubDomainCookies: {
      enabled: true,
      domain: `.${ROOT_DOMAIN}`,
    },
    cookiePrefix: 'dashboard',
    database: {
      generateId: 'serial',
    },
  },
  trustedOrigins: (request) => {
    if (!request) return []
    const origin = request.headers.get('origin')
    if (!origin) return []
    try {
      const url = new URL(origin)
      if (url.hostname.endsWith(`.${ROOT_DOMAIN}`) || url.hostname === ROOT_DOMAIN) {
        return [origin]
      }
    } catch {
      throw new Error('Invalid origin URL')
    }
    return []
  },
  plugins: [
    localization({
      defaultLocale: 'ru-RU',
      fallbackLocale: 'default',
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
} satisfies BetterAuthOptions

export const auth = betterAuth({
  ...options,
  plugins: [
    ...(options.plugins ?? []),
    customSession(async ({ user, session }) => {
      const userId = Number(session.userId)

      const [members, userRecord] = await Promise.all([
        prisma.member.findMany({
          where: { userId },
          include: { organization: true },
        }),
        prisma.user.findFirst({
          where: { id: userId },
          select: { role: true },
        }),
      ])

      const roles = userRecord?.role?.split(',') ?? []

      return {
        user,
        session,
        roles,
        members,
      }
    }, options),
  ],
})

export type Session = typeof auth.$Infer.Session
export type ActiveOrganization = typeof auth.$Infer.ActiveOrganization
export type OrganizationRole = ActiveOrganization['members'][number]['role']
export type Members = ActiveOrganization['members']
