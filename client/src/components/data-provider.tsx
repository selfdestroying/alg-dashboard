'use client'
import { api } from '@/lib/api/api-client'
import { ICourse } from '@/types/course'
import { IUser } from '@/types/user'
import { createContext, startTransition, useContext, useEffect, useState } from 'react'

const DataContext = createContext<{ courses: ICourse[]; teachers: IUser[] }>({
  courses: [],
  teachers: [],
})

export function DataProvider({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [courses, setCourses] = useState<ICourse[]>([])
  const [teachers, setTeachers] = useState<IUser[]>([])
  useEffect(() => {
    startTransition(async () => {
      const c = await api.get<ICourse[]>('courses', { cache: 'force-cache' })
      const t = await api.get<IUser[]>('teachers', { cache: 'force-cache' })
      setCourses(c.success ? c.data : [])
      setTeachers(t.success ? t.data : [])
    })
  }, [])
  return <DataContext.Provider value={{ courses, teachers }}>{children}</DataContext.Provider>
}

export const useData = () => {
  return useContext(DataContext)
}
