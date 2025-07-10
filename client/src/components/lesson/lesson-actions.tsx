import { ILesson } from '@/types/lesson'
import { ApiResponse } from '@/types/response'
import { toast } from 'sonner'
import { DeleteDialog } from '../delete-dialog'
import LessonDialog from './lesson-dialog'
import { apiDelete } from '@/lib/api/api-server'

export function LessonActions({ lesson }: { lesson: ILesson }) {
  const handleDelete = () => {
    const ok = new Promise<ApiResponse<boolean>>((resolve, reject) => {
      apiDelete<boolean>(`lessons/${lesson.id}`, {}, `dashboard/groups/${lesson.groupId}`).then(
        (r) => {
          if (r.success) {
            resolve(r)
          } else {
            reject(r)
          }
        }
      )
    })

    toast.promise(ok, {
      loading: 'Загрузка...',
      success: (data) => data.message,
      error: (data) => data.message,
    })
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <LessonDialog lesson={lesson} groupId={lesson.groupId} />
      <DeleteDialog handleDelete={handleDelete} />
    </div>
  )
}
