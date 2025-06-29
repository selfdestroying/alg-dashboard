import NavUser from '@/app/dashboard/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from './ui/sidebar'
import { Home, User, Users } from 'lucide-react'
import Link from 'next/link'
export default async function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const mainNavItems = [
    {
      title: 'Главная',
      url: '/dashboard',
      icon: Home,
      isActive: false,
    },
    {
      title: 'Ученики',
      url: '/dashboard/students',
      icon: User,
      isActive: false,
    },
    {
      title: 'Группы',
      url: '/dashboard/groups',
      icon: Users,
      isActive: false,
    },
  ]
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="pt-4">
        <NavUser />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Общее</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      {item.title}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
    </Sidebar>
  )
}
