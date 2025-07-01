'use server'
import { ApiResponse } from '@/types/response'
import { revalidatePath } from 'next/cache'
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
