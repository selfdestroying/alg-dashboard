import { getUser } from '@/actions/users'
import Calendar31 from '@/components/calendar-31'
import { StatsCards } from '@/components/stats-card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import prisma from '@/lib/prisma'

export default async function Page() {
  const user = await getUser()
  const teachers = await prisma.user.findMany()

  return (
    <div className="space-y-2">
      <Tabs defaultValue={user?.id.toString()}>
        <TabsList className="bg-muted/30 grid h-auto w-full grid-cols-2 p-1 md:grid-cols-3 lg:grid-cols-7">
          {teachers.map((teacher) => (
            <TabsTrigger key={teacher.id} value={teacher.id.toString()}>
              {teacher.firstName}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid gap-2">
        <StatsCards />
        <Calendar31 />
      </div>
    </div>
  )
}
