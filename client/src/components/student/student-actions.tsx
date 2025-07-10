'use client'
import { ApiResponse } from '@/types/response'
import { IStudent } from '@/types/student'
import { toast } from 'sonner'
import { DeleteDialog } from '../delete-dialog'
import StudentDialog from './student-dialog'
import { usePathname } from 'next/navigation'
import { apiDelete } from '@/lib/api/api-server'

export function Actions({ student }: { student: IStudent }) {
  const handleDelete = () => {
    const ok = new Promise<ApiResponse<boolean>>((resolve, reject) => {
      apiDelete<boolean>(`students/${student.id}`, {}, 'dashboard/students').then((r) => {
        if (r.success) {
          resolve(r)
        } else {
          reject(r)
        }
      })
    })

    toast.promise(ok, {
      loading: 'Загрузка...',
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

export function ActionsInGroup({ student }: { student: IStudent }) {
  const pathname = usePathname()
  const groupId = pathname.split('/')[pathname.split('/').length - 1]
  const handleDelete = () => {
    const ok = new Promise<ApiResponse<boolean>>((resolve, reject) => {
      api
        .delete<boolean>(
          'groups/remove-student',
          { groupId: groupId, studentId: student.id },
          `dashboard/groups/${groupId}`
        )
        .then((r) => {
          if (r.success) {
            resolve(r)
          } else {
            reject(r)
          }
        })
    })

    toast.promise(ok, {
      loading: 'Загрузка...',
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
