'use client'
import { getCourses, getTeachers } from '@/lib/utils'
import { ICourse } from '@/types/course'
import { ITeacher } from '@/types/user'
import { createContext, startTransition, useContext, useEffect, useState } from 'react'

const DataContext = createContext<{ courses: ICourse[]; teachers: ITeacher[] }>({
  courses: [],
  teachers: [],
})

export function DataProvider({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [courses, setCourses] = useState<ICourse[]>([])
  const [teachers, setTeachers] = useState<ITeacher[]>([])
  useEffect(() => {
    console.log('context')
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
