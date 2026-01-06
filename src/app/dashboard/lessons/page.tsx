import { getLessons } from '@/actions/lessons'
import { getUserByAuth } from '@/actions/users'
import LessonsTable from '@/components/tables/lessons-table'
import { redirect } from 'next/navigation'

export default async function Page() {
  const user = await getUserByAuth()
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
          teachers: {
            include: {
              teacher: {
                omit: {
                  password: true,
                  passwordRequired: true,
                  createdAt: true,
                },
              },
            },
          },
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
