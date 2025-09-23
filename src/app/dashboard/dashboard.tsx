'use client'

import { getStatistics } from '@/actions/statistic'
import { UserData } from '@/actions/users'
import LessonsCalendar from '@/components/lessons-calendar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

interface DashboardPageProps {
  user: UserData
  teachers: UserData[]
}

export default function DashboardPage({ user, teachers }: DashboardPageProps) {
  const [selectedTeacherId, setSelectedTeacherId] = useState(user.role == 'TEACHER' ? user.id : -1)
  const [statistics, setStatistics] = useState({
    totalStudents: 0,
    totalGroups: 0,
    totalPersonalGroups: 0,
    totalPersonalStudents: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStatistics() {
      setIsLoading(true)
      const statistics = await getStatistics(selectedTeacherId)
      setStatistics(statistics)
      setIsLoading(false)
    }
    fetchStatistics()
  }, [selectedTeacherId])

  return (
    <div className="space-y-2">
      {user?.role != 'TEACHER' && (
        <Tabs
          defaultValue={selectedTeacherId.toString()}
          onValueChange={(value) => setSelectedTeacherId(+value)}
        >
          <TabsList className="bg-muted/30 grid h-auto w-full grid-cols-2 p-1 md:grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="-1">Все</TabsTrigger>
            {teachers.map((teacher) => (
              <TabsTrigger key={teacher.id} value={teacher.id.toString()}>
                {teacher.firstName}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      <div className="grid gap-2">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="rounded-lg border p-2 text-xs shadow-xs">
              <Loader2 size={16} className="animate-spin" />
            </div>
            <div className="rounded-lg border p-2 text-xs shadow-xs">
              <Loader2 size={16} className="animate-spin" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="rounded-lg border p-2 text-xs shadow-xs">
              Количество учеников (мои/всего): {statistics.totalPersonalStudents}/
              {statistics.totalStudents}
            </div>
            <div className="rounded-lg border p-2 text-xs shadow-xs">
              Количество групп (мои/всего): {statistics.totalPersonalGroups}/
              {statistics.totalGroups}
            </div>
          </div>
        )}
        <LessonsCalendar selectedTeacherId={+selectedTeacherId} />
      </div>
    </div>
  )
}
