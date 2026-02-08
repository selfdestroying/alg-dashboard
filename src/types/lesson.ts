import { $Enums } from '@/prisma/generated/client'

export interface LessonDTO {
  id: number
  time: string | null
  groupId: number
  date: Date
  createdAt: Date
  status: $Enums.LessonStatus
}
