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
import { SmartFeedBar } from '@/src/features/smart-feed/components/smart-feed'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { Item } from '../ui/item'
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
          <Item className="bg-card ring-foreground/10 hidden ring-1 md:block" variant={'muted'}>
            <SmartFeedBar />
          </Item>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
