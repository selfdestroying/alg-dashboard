import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ChevronsUpDown, Users } from 'lucide-react'
import Groups from './groups'
import { IGroup } from '@/types/group'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import GroupDialog from '@/components/group/group-dialog'
import { getUser } from '@/lib/dal'
import { redirect } from 'next/navigation'
import { apiGet } from '@/lib/api/api-server'

export default async function Page({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await getUser()
  if (!user) {
    return redirect('/auth')
  }

  const groups = await apiGet<IGroup[]>('groups')
  if (!groups.success) {
    return (
      <Card>
        <CardHeader className="gap-0 justify-center">
          Ошибка при получении групп: {groups.message}
        </CardHeader>
      </Card>
    )
  }
  const filteredGroups =
    user.role == 'Admin' ? groups.data : groups.data.filter((g) => g.teacher.id == +user.id)
  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="lg:col-span-3">
        <Collapsible defaultOpen={true} className="space-y-2">
          <Card className="gap-2">
            <CardHeader className="grid-rows-1">
              <div className="flex items-center justify-between gap-2">
                <div className="space-y-2 flex-1/2">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {user.role == 'Admin' ? 'Все' : 'Мои'} Группы
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <GroupDialog />
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon" className="cursor-pointer size-8">
                      <ChevronsUpDown />
                      <span className="sr-only">Toggle</span>
                    </Button>
                  </CollapsibleTrigger>
                </div>
              </div>
            </CardHeader>
            {filteredGroups.length > 0 && (
              <CollapsibleContent>
                <CardContent className="space-y-2">
                  <Groups groups={filteredGroups} />
                </CardContent>
              </CollapsibleContent>
            )}
          </Card>
        </Collapsible>
      </div>
      <div className="lg:col-span-9">{children}</div>
    </div>
  )
}
