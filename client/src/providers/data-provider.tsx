"use client";

import { apiGet } from "@/actions/api";
import { ICourse } from "@/types/course";
import { IUser } from "@/types/user";
import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useState,
} from "react";

const DataContext = createContext<{ courses: ICourse[]; teachers: IUser[] }>({
  courses: [],
  teachers: [],
});

export function DataProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [teachers, setTeachers] = useState<IUser[]>([]);
  useEffect(() => {
    startTransition(async () => {
      const c = await apiGet<ICourse[]>("courses", { cache: "force-cache" });
      const t = await apiGet<IUser[]>("teachers", { cache: "force-cache" });
      setCourses(c.success ? c.data : []);
      setTeachers(t.success ? t.data : []);
    });
  }, []);
  return (
    <DataContext.Provider value={{ courses, teachers }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  return useContext(DataContext);
};
