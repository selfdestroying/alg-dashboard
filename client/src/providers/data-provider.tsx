'use client'

import { getCourses } from '@/actions/courses'
import { getUsers, UserData } from '@/actions/users'
import { Course } from '@prisma/client'
import { createContext, startTransition, useContext, useEffect, useState } from 'react'

const DataContext = createContext<{ courses: Course[]; users: UserData[] }>({
  courses: [],
  users: [],
})

export function DataProvider({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [courses, setCourses] = useState<Course[]>([])
  const [users, setusers] = useState<UserData[]>([])
  useEffect(() => {
    startTransition(async () => {
      const c = await getCourses()
      const t = await getUsers()
      setCourses(c)
      setusers(t)
    })
  }, [])
  return <DataContext.Provider value={{ courses, users }}>{children}</DataContext.Provider>
}

export const useData = () => {
  return useContext(DataContext)
}
