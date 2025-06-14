import { SidebarProvider } from '@/components/ui/sidebar'
import DashboardSidebar from './dashboard-sidebar'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      {children}
    </SidebarProvider>
  )
}
