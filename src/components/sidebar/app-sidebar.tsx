'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from '@/src/components/ui/sidebar'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import MobileHeader from './mobile-header'
import NavCollapse from './nav-collapse'
import NavOrganization from './nav-organization'
import NavPlatform from './nav-platform'
import NavShop from './nav-shop'
import NavTheme from './nav-theme'
import NavUser from './nav-user'

/** Закрывает мобильный сайдбар при смене маршрута */
function CloseSidebarOnNavigate() {
  const pathname = usePathname()
  const { setOpenMobile, isMobile } = useSidebar()

  useEffect(() => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }, [pathname, isMobile, setOpenMobile])

  return null
}

export function AppSidebar({
  children,
  defaultOpen,
}: {
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  return (
    <SidebarProvider defaultOpen={defaultOpen ?? false}>
      <CloseSidebarOnNavigate />
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <NavCollapse />
          <NavUser />
        </SidebarHeader>

        <SidebarContent>
          <NavPlatform />
          <NavShop />
        </SidebarContent>
        <SidebarFooter>
          <NavTheme />
          <NavOrganization />
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-w-0 bg-transparent">
        <div className="min-w-0 space-y-2 p-2">
          <MobileHeader />
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
