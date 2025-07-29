'use client'

import { UserData } from '@/actions/users'
import { Course } from '@prisma/client'
import { createContext, FC, ReactNode, useContext } from 'react'

const DataContext = createContext<{ courses: Course[]; users: UserData[] }>({
  courses: [],
  users: [],
})

interface DataProviderProps {
  courses: Course[]
  users: UserData[]
  children: ReactNode
}

export const DataProvider: FC<DataProviderProps> = ({ courses, users, children }) => {
  return <DataContext.Provider value={{ courses, users }}>{children}</DataContext.Provider>
}

export const useData = () => {
  return useContext(DataContext)
}
