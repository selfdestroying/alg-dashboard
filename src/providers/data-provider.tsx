'use client'

import { UserData } from '@/actions/users'
import { Course, Location, Role } from '@prisma/client'
import { createContext, FC, ReactNode, useContext } from 'react'

const DataContext = createContext<{
  courses: Course[]
  users: UserData[]
  locations: Location[]
  roles: Role[]
}>({
  courses: [],
  locations: [],
  users: [],
  roles: [],
})

interface DataProviderProps {
  courses: Course[]
  users: UserData[]
  locations: Location[]
  roles: Role[]
  children: ReactNode
}

export const DataProvider: FC<DataProviderProps> = ({
  courses,
  users,
  locations,
  roles,
  children,
}) => {
  return (
    <DataContext.Provider value={{ courses, users, locations, roles }}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => {
  return useContext(DataContext)
}
