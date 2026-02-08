import { getCourses } from '@/src/actions/courses'
import { useQuery } from '@tanstack/react-query'
import { courseKeys } from './keys'

export async function getCourseList(organizationId: number) {
  const data = await getCourses({
    where: {
      organizationId,
    },
  })

  return data
}
export type CourseListData = Awaited<ReturnType<typeof getCourseList>>

export const useCourseListQuery = (organizationId: number) => {
  return useQuery({
    queryKey: courseKeys.list(organizationId),
    queryFn: () => getCourseList(organizationId),
    enabled: !!organizationId,
  })
}

export const useMappedCourseListQuery = (organizationId: number) => {
  return useQuery({
    queryKey: courseKeys.list(organizationId),
    queryFn: () => getCourseList(organizationId),
    enabled: !!organizationId,
    select: (courses) =>
      courses.map((course) => ({
        value: course.id.toString(),
        label: course.name,
      })),
  })
}
