import { getGroups } from '@/actions/groups'
import { getMe } from '@/actions/users'
import FormDialog from '@/components/button-dialog'
import GroupForm from '@/components/forms/group-form'
import GroupsTable from '@/components/tables/groups-table'

export default async function Page() {
  const user = await getMe()
  const groups = await getGroups()

  return (
    <>
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
    </>
  )
}
