'use server'
import { ICourse } from '@/types/course'

export const getCourses = async () => {
  const coursesRes = await fetch('http://localhost:5120/api/courses', { cache: 'force-cache' })

  if (!coursesRes.ok) {
    return []
  }

  const courses: ICourse[] = await coursesRes.json()

  return courses
}
