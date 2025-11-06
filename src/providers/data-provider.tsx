'use client'

import { UserData } from '@/actions/users'
import { Course, Location } from '@prisma/client'
import { createContext, FC, ReactNode, useContext } from 'react'

const DataContext = createContext<{ courses: Course[]; users: UserData[]; locations: Location[] }>({
  courses: [],
  locations: [],
  users: [],
})

interface DataProviderProps {
  courses: Course[]
  users: UserData[]
  locations: Location[]
  children: ReactNode
}

export const DataProvider: FC<DataProviderProps> = ({ courses, users, locations, children }) => {
  return (
    <DataContext.Provider value={{ courses, users, locations }}>{children}</DataContext.Provider>
  )
}

export const useData = () => {
  return useContext(DataContext)
}
