'use server'

import { prisma } from '@/lib/prisma'
import { cache } from 'react'
import { Course } from '../../prisma/generated/prisma/browser'

export const getCourses = cache(async (): Promise<Course[]> => {
  const courses = await prisma.course.findMany()
  return courses
})
