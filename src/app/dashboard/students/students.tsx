'use client'

import { ColumnDef } from '@tanstack/react-table'
import { IStudent } from '@/types/student'
import { deleteStudent } from '@/actions/students'
import { toast } from 'sonner'
import { useState } from 'react'
import { DeleteDialog } from '@/components/delete-dialog'
import { usePathname } from 'next/navigation'
import { removeFromGroup } from '@/actions/groups'
import StudentDialog from '@/components/students/student-dialog'

function Actions({ student }: { student: IStudent }) {
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

function ActionsInGroup({ student }: { student: IStudent }) {
  const [, setIsLoading] = useState(false)
  const pathname = usePathname()
  const groupId = pathname.split('/')[pathname.split('/').length - 1]
  const handleDelete = () => {
    setIsLoading(true)
    const ok = removeFromGroup(+groupId, student.id)
    toast.promise(ok, {
      loading: 'Deleting...',
      success: 'Student has been removed from group!',
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
  {
    id: 'actionsInGroup',
    cell: ({ row }) => <ActionsInGroup student={row.original} />,
  },
]
