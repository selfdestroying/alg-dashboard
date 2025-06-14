import 'server-only'
import { cookies } from 'next/headers'
import { cache } from 'react'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { redirect } from 'next/navigation'

export const verifySession = cache(async () => {
  const token = (await cookies()).get('session')?.value
  if (!token) {
    redirect('/auth')
  }
  const session = jwt.decode(token) as JwtPayload
  return { isAuth: true, user: session }
})
