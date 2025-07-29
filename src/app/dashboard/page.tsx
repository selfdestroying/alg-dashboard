import { getRecentGroups, getTotalGroups, getTotalStudents } from '@/actions/dashborad'
import Chart from '@/components/chart'
import { StatsGrid } from '@/components/stats-grid'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import prisma from '@/lib/prisma'
import { AttendanceStatus } from '@prisma/client'
import { subDays } from 'date-fns'
import { User, Users } from 'lucide-react'

const StatusMap: { [key in AttendanceStatus]: string } = {
  ABSENT: 'Пропустил',
  PRESENT: 'Пришел',
  UNSPECIFIED: 'Не отмечен',
}

export default async function Page() {
  const totalGroups = await getTotalGroups()
  const recentGroups = await getRecentGroups()
  const totalStudents = await getTotalStudents()
  const recentStudents = await getTotalStudents()
  const groupGrowthRaw: { day: string; count: number }[] = await prisma.$queryRaw`
  SELECT 
    TO_CHAR(DATE_TRUNC('day', "createdAt"), 'DD.MM') AS day,
    COUNT(*) as count
  FROM "Group"
  WHERE "createdAt" >= NOW() - INTERVAL '30 days'
  GROUP BY day
  ORDER BY day;
`
  const studentGrowthRaw: { day: string; count: number }[] = await prisma.$queryRaw`
  SELECT 
    TO_CHAR(DATE_TRUNC('day', "createdAt"), 'DD.MM') AS day,
    COUNT(*) as count
  FROM "Student"
  WHERE "createdAt" >= NOW() - INTERVAL '30 days'
  GROUP BY day
  ORDER BY day;
`
  const attendanceGrowthRaw = await prisma.attendance.groupBy({
    by: ['status'],
    _count: {
      status: true,
    },
    where: {
      lesson: {
        date: {
          gte: subDays(new Date(), 7),
          lt: new Date(),
        },
      },
    },
  })

  const groupGrowth = groupGrowthRaw.map((row) => ({
    xAxisData: row.day,
    yAxisData: Number(row.count),
  }))
  const studentGrowth = studentGrowthRaw.map((row) => ({
    xAxisData: row.day,
    yAxisData: Number(row.count),
  }))
  const attendanceGrowth = attendanceGrowthRaw.map((row) => ({
    xAxisData: StatusMap[row.status],
    yAxisData: Number(row._count.status),
  }))
  return (
    <>
      <StatsGrid
        stats={[
          {
            title: 'Группы',
            value: totalGroups,
            change: recentGroups,
            icon: <Users />,
          },
          {
            title: 'Ученики',
            value: totalStudents,
            change: recentStudents,
            icon: <User />,
          },
        ]}
      />
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Прирост групп по дням</CardTitle>
          </CardHeader>
          <CardContent>
            <Chart data={groupGrowth} type="line" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Прирост учеников по дням</CardTitle>
          </CardHeader>
          <CardContent>
            <Chart data={studentGrowth} type="line" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Посещаемость</CardTitle>
          </CardHeader>
          <CardContent>
            <Chart data={attendanceGrowth} type="pie" />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
