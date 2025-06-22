'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { toast } from 'sonner'
import { DeleteDialog } from '@/components/delete-dialog'
import GroupDialog from '@/components/group/group-dialog'
import { IGroup } from '@/types/group'
import { ApiResponse } from '@/types/response'
import { api } from '@/lib/api/api-client'

export default function Actions({ group }: { group: IGroup }) {
  const handleDelete = () => {
    const ok = new Promise<ApiResponse<boolean>>((resolve, reject) => {
      api.delete<boolean>(`groups/${group.id}`, {}, 'dashboard/groups').then((r) => {
        if (r.success) {
          resolve(r)
        } else {
          reject(r)
        }
      })
    })

    toast.promise(ok, {
      loading: 'Loding...',
      success: (data) => data.message,
      error: (data) => data.message,
    })
  }
  return (
    <div className="flex items-center justify-end gap-2">
      <GroupDialog group={group} />
      <DeleteDialog handleDelete={handleDelete} />
    </div>
  )
}

export const columns: ColumnDef<IGroup>[] = [
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
