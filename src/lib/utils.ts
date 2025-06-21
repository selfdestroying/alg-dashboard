import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { ICourse } from '@/types/course'
import { ITeacher } from '@/types/user'

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

export const getTeachers = async () => {
  const res = await fetch('http://localhost:5120/api/teachers', { cache: 'force-cache' })
  if (!res.ok) {
    return []
  }
  const users: ITeacher[] = await res.json()
  return users
}
