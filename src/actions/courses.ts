'use server'

import { ICourse } from '@/types/course'

export default async function getCourses() {
  const coursesRes = await fetch('http://localhost:5120/api/courses')

  if (!coursesRes.ok) {
    return null
  }

  const courses: ICourse[] = await coursesRes.json()

  return courses
}
