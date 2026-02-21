'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/src/components/ui/sidebar'
import { useSessionQuery } from '@/src/data/user/session-query'
import { Skeleton } from '../ui/skeleton'

function NavOrganizationSkeleton() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" className="cursor-default">
          <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
          <Skeleton className="h-4 w-28" />
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export default function NavOrganization() {
  const { data: session, isLoading } = useSessionQuery()

  if (isLoading) {
    return <NavOrganizationSkeleton />
  }

  const orgName = session?.organization?.name

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Avatar>
            <AvatarImage alt={orgName} />
            <AvatarFallback>{orgName?.[0]}</AvatarFallback>
          </Avatar>

          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{orgName}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
