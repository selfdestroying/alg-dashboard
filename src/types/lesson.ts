import { $Enums } from '@prisma/client'

export interface LessonDTO {
  id: number
  time: string | null
  groupId: number
  date: Date
  createdAt: Date
  status: $Enums.LessonStatus
}
