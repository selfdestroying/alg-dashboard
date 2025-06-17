'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Trash } from 'lucide-react'
import { IStudent } from '@/types/student'
import { deleteStudent } from '@/actions/students'
import UpdateStudentDialog from './update-student-dialog'
import { toast } from 'sonner'
import { useState } from 'react'

export default function Actions({ student }: { student: IStudent }) {
  const [isLoading, setIsLoading] = useState(false)
  const handleDelete = () => {
    setIsLoading(true)
    const ok = deleteStudent(student.id)
    toast.promise(ok, {
      loading: 'Deleting...',
      success: 'Student has been deleted!',
      error: 'Error',
    })
  }
  return (
    <div className="flex items-center justify-end gap-2">
      <UpdateStudentDialog student={student} />
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
}

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
    cell: ({ row }) => <Actions student={row.original} />,
  },
]
