'use client'

import { ChartByCourse } from './chart-by-course'
import { ChartByMonth } from './chart-by-month'
import { ChartByTeacher } from './chart-by-teacher'

type MonthlyData = {
  month: string
  count: number
}

type TeacherData = {
  name: string
  dismissed: number
  total: number
  percentage: number
}

type CourseData = {
  name: string
  count: number
}

type DismissedStatisticsProps = {
  monthly: MonthlyData[]
  teachers: TeacherData[]
  courses: CourseData[]
}

// Основной компонент, который экспортируется
export default function DismissedStatistics({
  monthly,
  teachers,
  courses,
}: DismissedStatisticsProps) {
  return (
    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
      <ChartByMonth data={monthly} />
      <ChartByTeacher data={teachers} />
      <ChartByCourse data={courses} />
    </div>
  )
}
