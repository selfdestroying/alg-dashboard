export type RoleNames = 'Админ' | 'Основатель' | 'Учитель' | 'Менеджер'

export interface ITokenData {
  id: string
  name: string
  role: RoleNames
}
export interface IAuth {
  token: string
  expirationHours: string
}

export interface IRole {
  id: number
  name: RoleNames
}

export interface IUser {
  id: number
  name: string
  role: IRole
}
