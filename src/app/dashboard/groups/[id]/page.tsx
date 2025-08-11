import { getGroup } from '@/actions/groups'
import { Card, CardHeader } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import InfoSection from './info-section'
import LessonsSection from './lessons-section'
import StudentsSection from './students-section'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id
  const group = await getGroup(+id)
  if (!group) {
    return (
      <Card>
        <CardHeader className="justify-center gap-0">Ошибка при получении группы</CardHeader>
      </Card>
    )
  }
  return (
    <div className="space-y-4">
      <InfoSection group={group} />
      <Tabs defaultValue="attendance">
        <TabsList>
          <TabsTrigger value="students">Ученики</TabsTrigger>
          <TabsTrigger value="attendance">Расписание</TabsTrigger>
        </TabsList>
        <TabsContent value="students">
          <StudentsSection group={group} />
        </TabsContent>
        <TabsContent value="attendance">
          <LessonsSection group={group} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
