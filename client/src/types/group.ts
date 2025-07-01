import { ILesson } from './lesson'
import { IStudent } from './student'
import { IUser } from './user'

export enum DayOfWeek {
  'Воскресенье' = 0,
  'Понедельник' = 1,
  'Вторник' = 2,
  'Среда' = 3,
  'Четверг' = 4,
  'Пятница' = 5,
  'Суббота' = 6,
}

export enum GroupColors {
  'bg-blue-500' = 0,
  'bg-green-500' = 1,
  'bg-purple-500' = 2,
  'bg-orange-500' = 3,
}

export interface IGroup {
  id: number
  name: string
  course: string
  teacher: IUser
  startDate: string
  lessonDay: DayOfWeek
  lessonTime: string
  backOfficeUrl: string
  students: IStudent[]
  lessons: ILesson[]
}
