'use server'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import DashboardSidebar from './dashboard-sidebar'
import { verifySession } from '@/lib/dal'
import { ModeToggle } from '@/components/ui/mode-toggle'
import { IUser } from '@/types/user'

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await verifySession()

  return (
    <SidebarProvider>
      <DashboardSidebar user={session.user as IUser} />
      <main className="flex-1 p-6">
        <div className="mb-4 flex justify-between">
          <SidebarTrigger className="cursor-pointer" />
          <ModeToggle />
        </div>
        {children}
      </main>
    </SidebarProvider>
  )
}
