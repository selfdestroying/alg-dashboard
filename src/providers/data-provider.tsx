'use client'

import { UserData } from '@/actions/users'
import { Course, Location } from '@prisma/client'
import { createContext, FC, ReactNode, useContext } from 'react'

const DataContext = createContext<{
  courses: Course[]
  users: UserData[]
  locations: Location[]
  user: UserData | null
}>({
  courses: [],
  locations: [],
  users: [],
  user: null,
})

interface DataProviderProps {
  courses: Course[]
  users: UserData[]
  locations: Location[]
  user: UserData | null
  children: ReactNode
}

export const DataProvider: FC<DataProviderProps> = ({
  courses,
  users,
  locations,
  user,
  children,
}) => {
  return (
    <DataContext.Provider value={{ courses, users, locations, user }}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => {
  return useContext(DataContext)
}
