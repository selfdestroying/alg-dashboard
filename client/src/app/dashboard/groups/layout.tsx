import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { ChevronsUpDown, Users } from 'lucide-react'
import Groups from './groups'
import { IGroup } from '@/types/group'
import { api } from '@/lib/api/api-client'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import GroupDialog from '@/components/group/group-dialog'
import { getUser } from '@/lib/dal'

export default async function Page({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await getUser()
  const groups = await api.get<IGroup[]>('groups')

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="lg:col-span-3">
        <Collapsible defaultOpen={true} className="space-y-2">
          <Card className="gap-2">
            <CardHeader className="grid-rows-1">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Группы
                  </CardTitle>
                  <CardDescription>Выбери группу чтобы посмотреть детали</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {user && <GroupDialog />}
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon" className="cursor-pointer size-8">
                      <ChevronsUpDown />
                      <span className="sr-only">Toggle</span>
                    </Button>
                  </CollapsibleTrigger>
                </div>
              </div>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="space-y-3">
                {groups.success ? <Groups groups={groups.data} /> : <div>Error</div>}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>
      <div className="lg:col-span-9">{children}</div>
    </div>
  )
}
