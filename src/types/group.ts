import { ILesson } from './lesson'
import { IStudent } from './student'

export enum DayOfWeek {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
}

export interface IGroup {
  id: number
  name: string
  course: string
  teacher: string
  startDate: string
  lessonDay: DayOfWeek
  lessonTime: string
  students: IStudent[]
  lessons: ILesson[]
}
