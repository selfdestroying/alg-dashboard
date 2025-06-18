import { IStudent } from './student'

export interface IGroups {
  id: number
  name: string
  course: string
  students: IStudent[]
}
export interface IGroup {
  id: number
  name: string
  course: string
  students: IStudent[]
}
