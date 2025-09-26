import 'server-only'

import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

type JWTPayload = {
  userId: number | string
  expiresAt: Date
}

const secretKey = process.env.SESSION_SECRET
const key = new TextEncoder().encode(secretKey)

export async function encrypt(payload: JWTPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(key)
}

export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ['HS256'],
    })
    return payload
  } catch {
    return null
  }
}

export async function createSession(userId: number | string) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
  const session = await encrypt({ userId, expiresAt })

  ;(await cookies()).set('dashboard_session', session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })

  redirect('/dashboard')
}

export async function verifySession() {
  const cookie = (await cookies()).get('dashboard_session')?.value
  const session = await decrypt(cookie)

  if (!session?.userId) {
    return { isAuth: false, userId: null }
  }

  return { isAuth: true, userId: Number(session.userId) }
}

export async function updateSession() {
  const session = (await cookies()).get('dashboard_session')?.value
  const payload = await decrypt(session)

  if (!session || !payload) {
    return null
  }

  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  ;(await cookies()).set('dashboard_session', session, {
    httpOnly: true,
    secure: true,
    expires: expires,
    sameSite: 'lax',
    path: '/',
  })
}

export async function deleteSession() {
  ;(await cookies()).delete('dashboard_session')
}
