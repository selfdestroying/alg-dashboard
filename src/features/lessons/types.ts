import { Prisma } from '@/prisma/generated/client'

/** Full lesson detail with group, teachers, and attendance */
export type LessonDetail = Prisma.LessonGetPayload<{
  include: {
    teachers: {
      include: {
        teacher: true
      }
    }
    group: {
      include: {
        course: true
        location: true
        schedules: true
        groupType: { include: { rate: true } }
      }
    }
    attendance: {
      include: {
        student: true
        makeupForAttendance: { include: { lesson: true } }
        makeupAttendance: { include: { lesson: true } }
      }
    }
  }
}>

/** Single attendance row with student + relations */
export type AttendanceWithStudents = Prisma.AttendanceGetPayload<{
  include: {
    student: true
    makeupForAttendance: { include: { lesson: true } }
    makeupAttendance: { include: { lesson: true } }
  }
}>

/** Teacher lesson row */
export type TeacherLessonRow = Prisma.TeacherLessonGetPayload<{ include: { teacher: true } }>

/** Lesson item returned by the by-date API (for makeup dialog) */
export type LessonByDate = Prisma.LessonGetPayload<{
  include: {
    attendance: true
    group: { include: { course: true; location: true; schedules: true } }
    teachers: { include: { teacher: true } }
  }
}>
