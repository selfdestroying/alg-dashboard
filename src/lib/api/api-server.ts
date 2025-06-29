'use server'
import { ICourse } from '@/types/course'
import { IGroup } from '@/types/group'
import { ApiResponse } from '@/types/response'
import { IUser } from '@/types/user'
import { revalidatePath } from 'next/cache'
import { api } from './api-client'
import nodemailer from 'nodemailer'

export async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function apiRequest<T>(
  url: string,
  options?: RequestInit,
  revalidateUrl?: string
): Promise<ApiResponse<T>> {
  // await delay(1000)
  try {
    const res = await fetch(`${process.env.API_URL}/${url}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })
    if (revalidateUrl) {
      revalidatePath(revalidateUrl)
    }

    const data = await res.json()
    return {
      success: res.ok,
      ...data,
    }
  } catch (error: unknown) {
    let message = 'Unknown error occurred'
    if (error instanceof Error) {
      message = error.message
    }

    return {
      success: false,
      message,
    }
  }
}

export const getCourses = async () => {
  const coursesRes = await fetch(`${process.env.API_URL}/courses`, { cache: 'force-cache' })

  if (!coursesRes.ok) {
    return []
  }
  const courses: ICourse[] = await coursesRes.json()
  return courses
}

export const getTeachers = async () => {
  const res = await fetch(`${process.env.API_URL}/teachers`, { cache: 'force-cache' })
  if (!res.ok) {
    return []
  }
  const users: IUser[] = await res.json()
  return users
}

export const getGroups = async () => {
  const groups = await api.get<IGroup[]>('groups')
  if (!groups.success) {
    return []
  }
  return groups.data
}

export const sendEmail = async (name: string, feedback: string) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.yandex.ru',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  await transporter.sendMail({
    from: `ALG Dashboard<${process.env.EMAIL_USER}>`,
    to: 'max.f99@yandex.ru',
    subject: `Feedback from ${name}`,
    text: feedback,
  })
}
