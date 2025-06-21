'use client'

import { ColumnDef } from '@tanstack/react-table'
import { IStudent } from '@/types/student'
import { toast } from 'sonner'

import { DeleteDialog } from '@/components/delete-dialog'
import { usePathname } from 'next/navigation'
import StudentDialog from '@/components/student/student-dialog'
import { ApiResponse } from '@/types/response'
import { api } from '@/lib/api/api-client'

function Actions({ student }: { student: IStudent }) {
  const handleDelete = () => {
    const ok = new Promise<ApiResponse<boolean>>((resolve, reject) => {
      api.delete<boolean>(`students/${student.id}`, {}, 'dashboard/students').then((r) => {
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
      <StudentDialog student={student} />
      <DeleteDialog handleDelete={handleDelete} />
    </div>
  )
}

function ActionsInGroup({ student }: { student: IStudent }) {
  const pathname = usePathname()
  const groupId = pathname.split('/')[pathname.split('/').length - 1]
  const handleDelete = () => {
    const ok = new Promise<ApiResponse<boolean>>((resolve, reject) => {
      console.log(groupId, student.id)
      api
        .delete<boolean>(
          'groups/remove-student',
          { groupId: groupId, studentId: student.id },
          `dashboard/groups/${groupId}`
        )
        .then((r) => {
          console.log(r)
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
