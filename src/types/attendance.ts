import { $Enums } from '@/prisma/generated/client'

export interface AttendanceDTO {
  id: number
  lessonId: number
  studentId: number
  status: $Enums.AttendanceStatus
  comment: string
  studentStatus: $Enums.StudentStatus
}
