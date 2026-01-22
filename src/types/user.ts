import { $Enums } from '@prisma/client'
import { RoleDTO } from './role'

export interface UserDTO {
  id: number
  firstName: string
  lastName: string | null
  password: string
  roleId: number
  status: $Enums.UserStatus
  bidForLesson: number
  bidForIndividual: number
  createdAt: Date
  role: RoleDTO
}
