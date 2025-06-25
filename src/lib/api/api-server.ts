'use server'
import { API_URL } from '@/config'
import { ApiResponse } from '@/types/response'
import { revalidatePath } from 'next/cache'

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
    const res = await fetch(`${API_URL}/${url}`, {
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
