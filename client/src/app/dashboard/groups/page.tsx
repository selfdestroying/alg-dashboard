import { createGroup, getGroups } from '@/actions/groups'
import { getUser } from '@/actions/users'
import GroupDialog from '@/components/dialogs/group-dialog'
import GroupsTable from '@/components/tables/groups-table'
import { Button } from '@/components/ui/button'
import { getRandomDate, getRandomInteger } from '@/utils/random'
import { randomUUID } from 'crypto'
import { Dices } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function Page() {
  const user = await getUser()
  if (!user) {
    redirect('/auth')
  }
  const groups = await getGroups()

  async function generateGroup() {
    'use server'
    await createGroup({
      name: `Группа №${randomUUID().slice(0, 8)}`,
      teacherId: getRandomInteger(1, 7),
      courseId: getRandomInteger(1, 6),
      startDate: getRandomDate(),
      lessonCount: getRandomInteger(1, 32),
    })
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <GroupDialog />
        <Button size={'icon'} onClick={generateGroup}>
          <Dices />
        </Button>
      </div>
      <div>
        <GroupsTable groups={groups} user={user} />
      </div>
    </>
  )
}
