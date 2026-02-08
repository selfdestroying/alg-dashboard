import {
  adminClient,
  customSessionClient,
  inferAdditionalFields,
  organizationClient,
} from 'better-auth/client/plugins'
import { nextCookies } from 'better-auth/next-js'
import { createAuthClient } from 'better-auth/react' // make sure to import from better-auth/react
import {
  manager,
  ac as orgAc,
  owner as orgOwner,
  teacher,
} from '../shared/organization-permeissions'
import { ac, admin, owner, user } from '../shared/permissions'
import { auth } from './auth'

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>({
      user: {
        role: {
          type: 'string',
        },
      },
    }),
    nextCookies(),
    customSessionClient<typeof auth>(),
    adminClient({
      ac,
      roles: {
        admin,
        owner,
        user,
      },
    }),
    organizationClient({
      ac: orgAc,
      roles: {
        owner: orgOwner,
        manager,
        teacher,
      },
    }),
  ],
})
