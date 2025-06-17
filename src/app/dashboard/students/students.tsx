'use client'

import { ColumnDef } from '@tanstack/react-table'
import { IStudent } from '@/types/student'
import { deleteStudent } from '@/actions/students'
import StudentDialog from '../../../components/student-dialog'
import { toast } from 'sonner'
import { useState } from 'react'
import { DeleteDialog } from '@/components/delete-dialog'

export default function Actions({ student }: { student: IStudent }) {
  const [, setIsLoading] = useState(false)
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
      <StudentDialog student={student} />
      <DeleteDialog handleDelete={handleDelete} />
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

export const columnsInGroup: ColumnDef<IStudent>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'age',
    header: 'Age',
  },
]
