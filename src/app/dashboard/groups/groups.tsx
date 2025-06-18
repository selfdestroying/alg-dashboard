'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { IGroups } from '@/types/group'
import { deleteGroup } from '@/actions/groups'
import { toast } from 'sonner'
import { DeleteDialog } from '@/components/delete-dialog'
import GroupDialog from '@/components/groups/group-dialog'

export default function Actions({ group }: { group: IGroups }) {
  const handleDelete = () => {
    const ok = deleteGroup(group.id)
    toast.promise(ok, {
      loading: 'Deleting...',
      success: 'Group has been deleted!',
      error: 'Error',
    })
  }
  return (
    <div className="flex items-center justify-end gap-2">
      <GroupDialog group={group} />
      <DeleteDialog handleDelete={handleDelete} />
    </div>
  )
}

export const columns: ColumnDef<IGroups>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <Button variant={'link'} className="w-full p-0 h-fit">
        <Link href={`/dashboard/groups/${row.original.id}`} className="w-full text-start">
          {row.original.name}
        </Link>
      </Button>
    ),
  },
  {
    accessorKey: 'course',
    cell: ({ row }) => (
      <div className="w-32">
        <Badge variant="outline" className="text-muted-foreground">
          {row.original.course}
        </Badge>
      </div>
    ),
    header: 'Course',
  },
  {
    accessorKey: 'students',
    cell: ({ row }) => row.original.students.length,
    header: 'Students',
  },
  {
    id: 'actions',
    cell: ({ row }) => <Actions group={row.original} />,
  },
]
