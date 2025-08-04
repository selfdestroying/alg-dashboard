import { createGroup, getGroups } from '@/actions/groups'
import { getUser } from '@/actions/users'
import ButtonDialog from '@/components/button-dialog'
import GroupForm from '@/components/forms/group-form'
import GroupsTable from '@/components/tables/groups-table'
import { Button } from '@/components/ui/button'
import { GroupsProvider } from '@/providers/groups-provider'
import { getRandomDate, getRandomInteger } from '@/utils/random'
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
      teacherId: getRandomInteger(1, 7),
      courseId: getRandomInteger(1, 6),
      startDate: getRandomDate(),
      lessonCount: getRandomInteger(1, 32),
    })
  }

  return (
    <GroupsProvider groups={groups}>
      <div className="flex items-center gap-2">
        <ButtonDialog title="Добавить группу" submitButtonProps={{ form: 'group-form' }}>
          <GroupForm />
        </ButtonDialog>
        <Button size={'icon'} onClick={generateGroup}>
          <Dices />
        </Button>
      </div>
      <div>
        <GroupsTable groups={groups} user={user} />
      </div>
    </GroupsProvider>
  )
}
