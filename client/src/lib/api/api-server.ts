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
    if (error instanceof Error) message = error.message

    return {
      success: false,
      message,
    }
  }
}

export async function apiGet<T>(url: string, options?: object, revalidateUrl?: string) {
  return apiRequest<T>(url, { method: 'GET', ...options }, revalidateUrl)
}

export async function apiPost<T>(url: string, body?: object, revalidateUrl?: string) {
  return apiRequest<T>(url, { method: 'POST', body: JSON.stringify(body) }, revalidateUrl)
}

export async function apiPut<T>(url: string, body?: object, revalidateUrl?: string) {
  return apiRequest<T>(url, { method: 'PUT', body: JSON.stringify(body) }, revalidateUrl)
}

export async function apiDelete<T>(url: string, body?: object, revalidateUrl?: string) {
  return apiRequest<T>(url, { method: 'DELETE', body: JSON.stringify(body) }, revalidateUrl)
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
