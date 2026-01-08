import { getGroup } from '@/actions/groups'
import { getMe, getUsers, UserData } from '@/actions/users'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import GroupTeachersTable from './group-teachers-table'

interface TeachersSectionProps {
  group: Awaited<ReturnType<typeof getGroup>>
  currentTeachers: ({ teacher: UserData } & {
    teacherId: number
    groupId: number
  })[]
}

export default async function TeachersSection({ group, currentTeachers }: TeachersSectionProps) {
  const me = await getMe()
  const teachers = await getUsers({
    where: {
      id: { notIn: group.teachers.map((t) => t.teacherId) },
    },
  })

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Преподаватели</CardTitle>
          {me?.role !== 'TEACHER' && (
            <CardAction title="Добавить преподавателя">
              <Button variant="outline" size={'icon-sm'}>
                <Plus />
              </Button>
            </CardAction>
          )}
        </CardHeader>
        <CardContent>
          <GroupTeachersTable teachers={currentTeachers} />
        </CardContent>
      </Card>
    </>
  )
}
