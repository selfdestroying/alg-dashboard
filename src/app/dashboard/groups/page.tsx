import { getGroups } from '@/actions/groups'
import { getUser } from '@/actions/users'
import FormDialog from '@/components/button-dialog'
import GroupForm from '@/components/forms/group-form'
import GroupsTable from '@/components/tables/groups-table'
import { GroupsProvider } from '@/providers/groups-provider'

export default async function Page() {
  const user = await getUser()
  const groups = await getGroups()

  return (
    <GroupsProvider groups={groups}>
      <div className="flex items-center gap-2">
        <FormDialog
          title="Добавить группу"
          submitButtonProps={{ form: 'group-form' }}
          FormComponent={GroupForm}
        />
      </div>
      <div>
        <GroupsTable groups={groups} user={user!} />
      </div>
    </GroupsProvider>
  )
}
