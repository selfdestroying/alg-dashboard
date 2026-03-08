import { AttendanceStatus, LessonStatus, Prisma } from '@/prisma/generated/client'

export type LessonWithAttendance = Prisma.LessonGetPayload<{
  include: {
    attendance: {
      include: {
        student: {
          include: {
            groups: { include: { wallet: true } }
          }
        }
      }
    }
    group: { include: { course: true; location: true; groupType: true; schedules: true } }
    teachers: { include: { teacher: true } }
  }
}>

export interface StudentRevenue {
  id: number
  name: string
  revenue: number
  isTrial: boolean
  status: AttendanceStatus
}

export interface LessonRevenue {
  id: number
  time: string | null
  groupId: number
  groupName: string
  groupTypeName: string | null
  locationName: string | null
  lessonStatus: LessonStatus
  revenue: number
  students: StudentRevenue[]
  studentCount: number
  paidCount: number
  presentCount: number
  absentCount: number
  trialCount: number
}

export interface DayRevenue {
  date: Date
  dateKey: string
  revenue: number
  lessons: LessonRevenue[]
  totalStudents: number
  paidStudents: number
}

export interface RevenueFilters {
  startDate: string
  endDate: string
  courseIds?: number[]
  locationIds?: number[]
  teacherIds?: number[]
}
