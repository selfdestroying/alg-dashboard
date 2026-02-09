'use client'

import { ChartByCourse } from './chart-by-course'
import { ChartByLocation } from './chart-by-location'
import { ChartByMonth } from './chart-by-month'
import { ChartByTeacher } from './chart-by-teacher'

type ChartDataKeyCount = {
  name: string
  count: number
}

type MonthlyData = {
  month: string
  count: number
}

type ActiveStatisticsProps = {
  monthly: MonthlyData[]
  locations: ChartDataKeyCount[]
  teachers: ChartDataKeyCount[]
  courses: ChartDataKeyCount[]
}

export default function ActiveStatistics({
  monthly,
  locations,
  teachers,
  courses,
}: ActiveStatisticsProps) {
  return (
    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-2">
      <ChartByMonth data={monthly} />
      <ChartByLocation data={locations} />
      <ChartByTeacher data={teachers} />
      <ChartByCourse data={courses} />
    </div>
  )
}
