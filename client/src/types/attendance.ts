export enum AttendanceStatus {
  Unspecified = 0,
  Present = 1,
  Absent = 2,
}

export interface IAttendance {
  studentId: number
  lessonId: number
  student: string
  status: AttendanceStatus
  comment: string
}
