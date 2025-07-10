import { IGroup } from './group'
import { IStudent } from './student'

export interface IPayment {
  student: IStudent
  group: IGroup
  totalPaidClasses: number
  classesLeft: number
}
