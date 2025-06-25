'use server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function createSession(token: string) {
  const expiresAt = new Date(Date.now() + 1 * 60 * 1000)
  const cookieStore = await cookies()

  cookieStore.set('session', token, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })
  redirect('/dashboard')
}

export async function deleteSession() {
  ;(await cookies()).delete('session')
  redirect('/dashboard')
}
