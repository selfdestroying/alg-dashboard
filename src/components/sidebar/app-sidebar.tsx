'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { useAuth } from '@/providers/auth-provider'
import { ComponentProps } from 'react'
import NavPlatform from './nav-platform'
import NavTheme from './nav-theme'
import NavUser from './nav-user'

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const user = useAuth()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavUser user={user} />
      </SidebarHeader>

      <SidebarContent>
        <NavPlatform />
        {/* <NavShop /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavTheme />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
