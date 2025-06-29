import { IAttendance } from './attendance'

export interface ILesson {
  id: number
  date: string
  time: string
  groupId: number
  attendances: IAttendance[]
}
