import { getUserByAuth } from '@/actions/users'
import { AppSidebar } from '@/components/app-sidebar'
import { ModeToggle } from '@/components/mode-toggle'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { redirect } from 'next/navigation'

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await getUserByAuth()
  if (!user) {
    return redirect('/auth')
  }

  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="overflow-hidden px-2 md:px-4 lg:px-6">
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b">
            <div className="flex items-center gap-2">
              <SidebarTrigger variant={'outline'} />
            </div>

            <div className="flex items-center gap-2">
              <ModeToggle />
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-2">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}
