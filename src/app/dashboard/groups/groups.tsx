'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, Trash } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { IGroups } from '@/types/group'
import { useState } from 'react'
import { deleteGroup } from '@/actions/groups'
import { toast } from 'sonner'
import UpdateStudentDialog from '../students/update-student-dialog'

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
    cell: ({ row }) => row.original.students,
    header: 'Students',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const [isLoading, setIsLoading] = useState(false)
      const handleDelete = () => {
        setIsLoading(true)
        const ok = deleteGroup(row.original.id)
        toast.promise(ok, {
          loading: 'Deleting...',
          success: 'Student has been deleted!',
          error: 'Error',
        })
      }
      return (
        <div className="flex items-center justify-end gap-2">
          <UpdateStudentDialog />
          <Button
            variant={'outline'}
            className="cursor-pointer"
            onClick={handleDelete}
            disabled={isLoading}
          >
            <Trash className="text-red-500" />
          </Button>
        </div>
      )
    },
  },
]
