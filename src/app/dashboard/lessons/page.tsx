import { getLessons } from '@/actions/lessons'
import { getUser } from '@/actions/users'
import LessonsTable from '@/components/tables/lessons-table'
import { redirect } from 'next/navigation'

export default async function Page() {
  const user = await getUser()
  if (!user) {
    return redirect('/auth')
  }
  const lessons = await getLessons({
    include: {
      attendance: {
        include: {
          student: true,
        },
      },
      group: {
        include: {
          teacher: true,
        },
      },
    },
  })

  return (
    <div>
      <LessonsTable lessons={lessons} user={user} />
    </div>
  )
}
