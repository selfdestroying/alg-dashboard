'use client'

import { apiGet } from '@/actions/api'
import { ICourse } from '@/types/course'
import { IUser } from '@/types/user'
import { createContext, startTransition, useContext, useEffect, useState } from 'react'

const DataContext = createContext<{ courses: ICourse[]; users: IUser[] }>({
  courses: [],
  users: [],
})

export function DataProvider({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [courses, setCourses] = useState<ICourse[]>([])
  const [users, setusers] = useState<IUser[]>([])
  useEffect(() => {
    startTransition(async () => {
      const c = await apiGet<ICourse[]>('courses', { cache: 'force-cache' })
      const t = await apiGet<IUser[]>('users', { cache: 'force-cache' })
      setCourses(c.success ? c.data : [])
      setusers(t.success ? t.data : [])
    })
  }, [])
  return <DataContext.Provider value={{ courses, users }}>{children}</DataContext.Provider>
}

export const useData = () => {
  return useContext(DataContext)
}
