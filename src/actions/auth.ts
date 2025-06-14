'use server'
import createSession from '@/lib/session'
import { redirect } from 'next/navigation'

export async function signin(username: string, password: string) {
  const res = await fetch('http://localhost:5120/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) {
    return null
  }
  const token = (await res.json()).token as string
  await createSession(token)
  redirect('/dashboard')
}
