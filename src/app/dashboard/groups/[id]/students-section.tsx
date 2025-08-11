import { AllGroupData } from '@/actions/groups'
import GroupStudentsTable from '@/components/tables/group-students-table'

export default async function StudentsSection({ group }: { group: AllGroupData }) {
  return <GroupStudentsTable group={group} />
}
