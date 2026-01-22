import { getCourses } from '@/actions/courses'
import { getMe } from '@/actions/users'
import { AppSidebar } from '@/components/sidebar/app-sidebar'
import { Toaster } from '@/components/toaster'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { prisma } from '@/lib/prisma'
import { AuthProvider } from '@/providers/auth-provider'
import { DataProvider } from '@/providers/data-provider'
import { Folder, Users } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await getMe()

  if (!user) {
    return redirect('/login')
  }

  const courses = await getCourses()
  const locations = await prisma.location.findMany()
  const users = await prisma.user.findMany({
    include: {
      role: true,
    },
  })
  const roles = await prisma.role.findMany()

  const studentsCount = await prisma.student.count({
    where: {
      dismisseds: { none: {} },
    },
  })
  const groupsCount = await prisma.group.count()

  return (
    <>
      <AuthProvider user={user}>
        <DataProvider courses={courses} locations={locations} users={users} roles={roles}>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="space-y-2 overflow-hidden p-2">
              <div className="flex items-center justify-between">
                <SidebarTrigger variant={'outline'} />
                <div className="bg-card flex items-center gap-2 rounded-md border px-2 py-0.5 text-sm shadow-sm">
                  <div className="flex items-center gap-1" title="Количество активных учеников">
                    <Users className="h-3 w-3" />
                    <span className="text-xs font-medium">{studentsCount}</span>
                  </div>
                  <div className="bg-border h-4.5 w-px" />
                  <div className="flex items-center gap-1" title="Количество групп">
                    <Folder className="h-3 w-3" />
                    <span className="text-xs font-medium">{groupsCount}</span>
                  </div>
                </div>
              </div>
              {children}
            </SidebarInset>
            <Toaster />
          </SidebarProvider>
        </DataProvider>
      </AuthProvider>
    </>
  )
}
