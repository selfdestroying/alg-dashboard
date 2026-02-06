import { AppSidebar } from '@/src/components/sidebar/app-sidebar'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/src/components/ui/sidebar'

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="space-y-2 overflow-hidden p-2">
          <div className="flex items-center justify-between">
            <SidebarTrigger variant={'outline'} />
          </div>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}
