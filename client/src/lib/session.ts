'use server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function createSession(token: string, expirationHours: string) {
  const expiresAt = new Date(Date.now() + +expirationHours * 60 * 60 * 1000)
  const cookieStore = await cookies()

  cookieStore.set('session', token, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: 'none',
    path: '/',
  })
  redirect('/dashboard')
}

export async function deleteSession() {
  ;(await cookies()).delete('session')
  redirect('/')
}
