import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import DashboardSidebar from '../../components/dashboard-sidebar'
import { getUser } from '@/lib/dal'
import { ModeToggle } from '@/components/ui/mode-toggle'

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await getUser()

  return (
    <SidebarProvider>
      <DashboardSidebar user={user} />
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
