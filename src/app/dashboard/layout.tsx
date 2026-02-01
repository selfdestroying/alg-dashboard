import { getCourses } from '@/actions/courses'
import { getMe } from '@/actions/users'
import { AppSidebar } from '@/components/sidebar/app-sidebar'
import { Toaster } from '@/components/toaster'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { prisma } from '@/lib/prisma'
import { AuthProvider } from '@/providers/auth-provider'
import { DataProvider } from '@/providers/data-provider'
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

  return (
    <>
      <AuthProvider user={user}>
        <DataProvider courses={courses} locations={locations} users={users} roles={roles}>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="space-y-2 overflow-hidden p-2">
              <div className="flex items-center justify-between">
                <SidebarTrigger variant={'outline'} />
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
