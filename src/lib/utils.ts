import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { ICourse } from '@/types/course'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getCourses = async () => {
  const coursesRes = await fetch('http://localhost:5120/api/courses', { cache: 'force-cache' })

  if (!coursesRes.ok) {
    return []
  }
  const courses: ICourse[] = await coursesRes.json()
  return courses
}
