'use server'

import prisma from '@/lib/prisma'
import { Course } from '@prisma/client'
import { cache } from 'react'

export const getCourses = cache(async (): Promise<Course[]> => {
  const courses = await prisma.course.findMany()
  return courses
})
