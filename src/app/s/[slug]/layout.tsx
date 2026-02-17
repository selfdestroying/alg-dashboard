import { AppSidebar } from '@/src/components/sidebar/app-sidebar'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/src/components/ui/sidebar'
import { auth } from '@/src/lib/auth'
import type { Metadata } from 'next'
import { headers } from 'next/headers'

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({ headers: requestHeaders })
  const orgName = session?.organization?.name ?? 'ЕДУДА'

  return {
    title: {
      template: `%s | ${orgName}`,
      default: orgName,
    },
  }
}

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
