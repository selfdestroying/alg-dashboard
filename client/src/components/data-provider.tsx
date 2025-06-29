'use client'
import { getCourses, getTeachers } from '@/lib/api/api-server'
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
      setCourses(await getCourses())
      setTeachers(await getTeachers())
    })
  }, [])
  return <DataContext.Provider value={{ courses, teachers }}>{children}</DataContext.Provider>
}

export const useData = () => {
  return useContext(DataContext)
}
