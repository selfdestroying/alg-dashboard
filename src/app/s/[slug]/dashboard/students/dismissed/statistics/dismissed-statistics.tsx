'use client'

import { ChartByCourse } from './chart-by-course'
import { ChartByLocation } from './chart-by-location'
import { ChartByMonth } from './chart-by-month'
import { ChartByTeacher } from './chart-by-teacher'

type MonthlyData = {
  month: string
  count: number
}

type TeacherData = {
  teacherName: string
  dismissedCount: number
  totalStudents: number
  percentage: number
}

type CourseData = {
  name: string
  count: number
}

type LocationData = {
  name: string
  count: number
}

type DismissedStatisticsProps = {
  monthly: MonthlyData[]
  teachers: TeacherData[]
  courses: CourseData[]
  locations: LocationData[]
}

// Основной компонент, который экспортируется
export default function DismissedStatistics({
  monthly,
  teachers,
  courses,
  locations,
}: DismissedStatisticsProps) {
  return (
    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-2">
      <ChartByMonth data={monthly} />
      <ChartByLocation data={locations} />
      <ChartByTeacher data={teachers} />
      <ChartByCourse data={courses} />
    </div>
  )
}
