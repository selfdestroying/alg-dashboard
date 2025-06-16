'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, EllipsisVertical, Trash } from 'lucide-react'
import { IStudent } from '@/types/student'
import { deleteStudent } from '@/actions/students'
import UpdateStudentDialog from './update-student-dialog'
import { toast } from 'sonner'
import { useState } from 'react'

export const columns: ColumnDef<IStudent>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'age',
    header: 'Age',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const [isLoading, setIsLoading] = useState(false)
      const handleDelete = () => {
        setIsLoading(true)
        const ok = deleteStudent(row.original.id)
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
