import { getUsers } from '@/actions/users'
import { Card, CardContent } from '@/components/ui/card'
import { Fragment } from 'react'
import Salaries from './salaries'
import UserBid from './user-bids'

export default async function Page() {
  const users = await getUsers()

  return (
    <>
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {users.map((user) => (
              <Fragment key={user.id}>
                <UserBid user={user} />
              </Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      <Salaries />
    </>
  )
}
