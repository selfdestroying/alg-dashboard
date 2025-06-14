import { GraduationCap, Home, User, Users } from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import Link from 'next/link'
import { NavUser } from './nav-user'
import { verifySession } from '@/lib/dal'

const mainNavItems = [
  {
    title: 'Main',
    url: '/',
    icon: Home,
    isActive: false,
  },
  {
    title: 'Students',
    url: '/dashboard/students',
    icon: User,
    isActive: false,
  },
  {
    title: 'Groups',
    url: '/dashboard/groups',
    icon: Users,
    isActive: false,
  },
]

const additionalNavItems = [
  {
    title: 'Teachers',
    url: '/dashboard/teachers',
    icon: GraduationCap,
    isActive: false,
  },
]

export default async function DashboardSidebar() {
  const session = await verifySession()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <NavUser />
      </SidebarHeader>
      <SidebarSeparator className="mx-0" />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Section</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {session.user.role == 'Admin' && (
          <>
            <SidebarSeparator className="mx-0" />
            <SidebarGroup>
              <SidebarGroupLabel>Admin Section</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {additionalNavItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
    </Sidebar>
  )
}
