export const ALERT_TYPE = {
  UNMARKED_ATTENDANCE: 'UNMARKED_ATTENDANCE',
  LOW_BALANCE: 'LOW_BALANCE',
  NEGATIVE_BALANCE: 'NEGATIVE_BALANCE',
  CONSECUTIVE_ABSENCES: 'CONSECUTIVE_ABSENCES',
} as const

export type AlertType = (typeof ALERT_TYPE)[keyof typeof ALERT_TYPE]

export type AlertSeverity = 'red' | 'orange' | 'yellow'

export interface UnmarkedAttendanceAlert {
  type: typeof ALERT_TYPE.UNMARKED_ATTENDANCE
  severity: 'red'
  lessonId: number
  lessonDate: Date
  lessonTime: string
  groupId: number
  groupName: string
  unspecifiedCount: number
}

export interface LowBalanceAlert {
  type: typeof ALERT_TYPE.LOW_BALANCE
  severity: 'yellow'
  walletId: number
  studentId: number
  studentName: string
  groupId: number
  groupName: string
  lessonsBalance: number
}

export interface NegativeBalanceAlert {
  type: typeof ALERT_TYPE.NEGATIVE_BALANCE
  severity: 'red'
  walletId: number
  studentId: number
  studentName: string
  groupId: number
  groupName: string
  lessonsBalance: number
}

export interface ConsecutiveAbsencesAlert {
  type: typeof ALERT_TYPE.CONSECUTIVE_ABSENCES
  severity: 'orange'
  studentId: number
  studentName: string
  groupId: number
  groupName: string
  absenceCount: number
}

export type SmartFeedAlert =
  | UnmarkedAttendanceAlert
  | LowBalanceAlert
  | NegativeBalanceAlert
  | ConsecutiveAbsencesAlert
