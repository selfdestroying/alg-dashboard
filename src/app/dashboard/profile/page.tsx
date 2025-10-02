import { getUser } from '@/actions/users'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { ChangePasswordCard } from './change-password-card'

export default async function Page() {
  const user = await getUser()

  if (!user) {
    return <div>User not found</div>
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col items-center justify-between gap-4 border-b p-4 sm:flex-row">
          <div className="flex items-center gap-4">
            <Avatar className="size-12">
              <AvatarFallback className="bg-primary text-primary-foreground rounded-full text-xl font-bold">
                {user.firstName?.[0]?.toUpperCase()}
                {user.lastName?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl font-bold">
              <div className="flex items-center gap-2 text-left">
                <span className="truncate font-medium">{user.firstName}</span>
                <Badge variant={'outline'}>{user.role}</Badge>
              </div>
            </CardTitle>
          </div>
        </CardHeader>
      </Card>
      <ChangePasswordCard user={user} />
    </>
  )
}
