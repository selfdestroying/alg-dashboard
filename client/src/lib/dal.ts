import 'server-only'
import { cookies } from 'next/headers'
import { cache } from 'react'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { IUser } from '@/types/user'

export const verifySession = cache(async () => {
  try {
    const token = (await cookies()).get('session')?.value
    if (!token) {
      return { user: null }
    }
    const session = jwt.decode(token) as JwtPayload
    return { user: session }
  } catch {
    return null
  }
})

export const getUser = async () => {
  try {
    const token = (await cookies()).get('session')?.value
    if (!token) {
      return null
    }
    const session = jwt.decode(token) as IUser
    return session
  } catch {
    return null
  }
}
