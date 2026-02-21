'use client'

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/src/components/ui/sidebar'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'

export default function NavCollapse() {
  const { toggleSidebar, state } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="sm" onClick={toggleSidebar}>
          {state === 'expanded' ? <PanelLeftClose /> : <PanelLeftOpen />}
          <span>Свернуть</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
