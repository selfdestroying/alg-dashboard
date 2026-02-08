'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/src/components/ui/sidebar'
import { ComponentProps } from 'react'
import NavOrganization from './nav-organization'
import NavPlatform from './nav-platform'
import NavShop from './nav-shop'
import NavTheme from './nav-theme'
import NavUser from './nav-user'

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
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
      <SidebarRail />
    </Sidebar>
  )
}
