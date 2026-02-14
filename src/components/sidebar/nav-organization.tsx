'use client'
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar'
import { DropdownMenu, DropdownMenuTrigger } from '@/src/components/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/src/components/ui/sidebar'
import { useSessionQuery } from '@/src/data/user/session-query'
import { ChevronsUpDown } from 'lucide-react'
import { Skeleton } from '../ui/skeleton'

export default function NavOrganization() {
  const { data: session, isLoading: isOrganizationLoading } = useSessionQuery()

  if (isOrganizationLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            className="bg-sidebar-accent text-sidebar-accent-foreground cursor-not-allowed"
          >
            <Skeleton className="h-full w-full" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              />
            }
          >
            <Avatar>
              <AvatarImage alt={session?.organization?.name} />
              <AvatarFallback>{session?.organization?.name[0]}</AvatarFallback>
            </Avatar>

            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{session?.organization?.name}</span>
            </div>
            <ChevronsUpDown />
          </DropdownMenuTrigger>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
