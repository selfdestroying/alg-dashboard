import { getUser, getUsers } from '@/actions/users'
import { Card, CardContent } from '@/components/ui/card'
import { Fragment } from 'react'
import Salaries from './salaries'
import TeacherBids from './teacher-bids'

export default async function Page() {
  const user = await getUser()
  const users = await getUsers()

  return (
    <>
      {(user?.role == 'ADMIN' || user?.role == 'OWNER') && (
        <Card>
          <CardContent>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {users.map((user) => (
                <Fragment key={user.id}>
                  <TeacherBids user={user} />
                </Fragment>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {user?.role == 'TEACHER' || user?.role == 'MANAGER' ? (
        <Salaries userId={user.id} />
      ) : (
        <Salaries />
      )}
    </>
  )
}
