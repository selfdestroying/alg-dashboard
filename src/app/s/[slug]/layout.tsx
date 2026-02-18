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
      {/* Decorative background orbs */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="animate-landing-float bg-primary/10 absolute -top-32 -right-32 h-96 w-96 rounded-full blur-3xl" />
        <div className="animate-landing-float-delayed bg-primary/8 absolute -bottom-40 -left-40 h-120 w-120 rounded-full blur-3xl" />
      </div>

      {/* Subtle grid pattern */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[4rem_4rem] opacity-30" />

      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="space-y-2 overflow-hidden bg-transparent p-2">
          <div className="flex items-center justify-between">
            <SidebarTrigger variant={'outline'} />
          </div>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}
