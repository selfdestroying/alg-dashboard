'use server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcrypt'
import { createSession, deleteSession } from '../lib/session'
import { redirect } from 'next/navigation'
import { signInFormSchema } from '@/schemas/auth'

export async function sigin(
  state: any | undefined,
  formData: FormData
): Promise<any | undefined> {
  const validatedFields = signInFormSchema.safeParse({
    user: formData.get('user'),
    password: formData.get('password'),
  })



  if (!validatedFields.success) {
    return { success: false, message: validatedFields.error.message }
  }

  const { user: name, password } = validatedFields.data

  const user = await prisma.user.findFirst({ where: { firstName: name } })
  if (!user) {
    return { success: false, message: 'User not found' }
  }


  if (['ADMIN', 'OWNER', 'MANAGER'].includes(user.role)) {
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return { success: false, message: 'Invalid password' }
    }
  }

  await createSession(user.id)
  redirect('/dashboard123')
}

export async function signout() {
  await deleteSession()
  redirect('/auth')
}
