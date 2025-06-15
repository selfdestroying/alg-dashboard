'use server'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import DashboardSidebar, { IUser } from './dashboard-sidebar'
import { verifySession } from '@/lib/dal'

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await verifySession()

  return (
    <SidebarProvider>
      <DashboardSidebar user={session.user as IUser} />
      <main className="flex-1 p-6">
        <div className="mb-4">
          <SidebarTrigger />
        </div>
        {children}
      </main>
    </SidebarProvider>
  )
}
