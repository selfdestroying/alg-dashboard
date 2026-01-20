'use server'
import { prisma } from '@/lib/prisma'
import { changePasswordSchema, signInFormSchema } from '@/schemas/auth'
import bcrypt from 'bcrypt'
import { redirect } from 'next/navigation'
import z from 'zod/v4'
import { createSession, deleteSession } from '../lib/session'

export async function login(payload: z.infer<typeof signInFormSchema>) {
  const {
    user: { value: userId },
    password,
  } = payload

  const user = await prisma.user.findFirst({ where: { id: userId } })
  if (!user) {
    return { success: false, name: 'user', message: 'Пользователь не найден' }
  }

  const isValidPassword = await bcrypt.compare(password, user.password)
  if (!isValidPassword) {
    return { success: false, name: 'password', message: 'Неверный пароль' }
  }

  await createSession(user.id)
  redirect('/dashboard')
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function changePassword(state: any | undefined, formData: FormData) {
  const validatedFields = changePasswordSchema.safeParse({
    user: formData.get('user'),
    currentPassword: formData.get('currentPassword'),
    newPassword: formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword'),
  })
  if (!validatedFields.success) {
    return { success: false, message: validatedFields.error.message }
  }

  const { user: name, currentPassword, newPassword, confirmPassword } = validatedFields.data
  const user = await prisma.user.findFirst({ where: { firstName: name } })
  if (!user) {
    return { success: false, message: 'Пользователь не найден' }
  }
  const isValidPassword = await bcrypt.compare(currentPassword, user.password)
  if (!isValidPassword) {
    return { success: false, message: 'Неверный пароль' }
  }

  if (newPassword !== confirmPassword) {
    return { success: false, message: 'Пароли не совпадают' }
  }

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: await bcrypt.hash(newPassword, 10),
    },
  })

  return { success: true, message: 'Пароль успешно изменен' }
}

export async function logout() {
  await deleteSession()
  redirect('/login')
}
