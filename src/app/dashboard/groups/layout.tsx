import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { ChevronsUpDown, Users } from 'lucide-react'
import Groups from './groups'
import { IGroup } from '@/types/group'
import { api } from '@/lib/api/api-client'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { GroupForm } from '@/components/group/group-form'
import { format } from 'date-fns'
import GroupDialog from '@/components/group/group-dialog'

export default async function Page({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const groups = await api.get<IGroup[]>('groups')

  return (
    <Collapsible defaultOpen={true} className="space-y-2">
      <div className="grid gap-6 lg:grid-cols-12 h-screen">
        <div className="lg:col-span-3 max-h-full">
          <Card className="gap-2">
            <CardHeader className="grid-rows-1">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Groups
                  </CardTitle>
                  <CardDescription>Select a group to view details</CardDescription>
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
            <CollapsibleContent>
              <CardContent className="space-y-3">
                {groups.success ? <Groups groups={groups.data} /> : <div>Error</div>}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </div>
        <div className="lg:col-span-9 overflow-y-auto">{children}</div>
      </div>
    </Collapsible>
  )
}
