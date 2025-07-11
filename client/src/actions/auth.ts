import 'server-only'
import { ITokenData } from '@/types/user'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export const getUser = async () => {
  try {
    const token = (await cookies()).get('session')?.value
    if (!token) {
      return null
    }
    const session = jwt.decode(token) as ITokenData
    return session
  } catch {
    return null
  }
}
