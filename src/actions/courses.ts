'use server'

import { Prisma } from '../../prisma/generated/client'
import { withSessionRLS } from '../lib/rls'

export const getCourses = async <T extends Prisma.CourseFindManyArgs>(
  payload?: Prisma.SelectSubset<T, Prisma.CourseFindManyArgs>
) => {
  return withSessionRLS((tx) => tx.course.findMany(payload))
}
