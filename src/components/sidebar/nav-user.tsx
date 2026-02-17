'use client'
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/src/components/ui/sidebar'
import { useSignOutMutation } from '@/src/data/user/sign-out-mutation'
import { ChevronsUpDown, Loader, LogOut, User } from 'lucide-react'
import Link from 'next/link'

import { useSessionQuery } from '@/src/data/user/session-query'
import { OrganizationRole } from '@/src/lib/auth'
import { useRouter } from 'next/navigation'
import { Skeleton } from '../ui/skeleton'

export const memberRoleLabels = {
  owner: 'Владелец',
  manager: 'Менеджер',
  teacher: 'Учитель',
} as const satisfies Record<OrganizationRole, string>

export default function NavUser() {
  const router = useRouter()
  const { data: session, isLoading } = useSessionQuery()
  const { mutate, isPending: isSignOutPending } = useSignOutMutation()

  if (isLoading) {
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
            {isLoading ? (
              <Loader className="animate-spin" />
            ) : (
              <>
                <Avatar>
                  <AvatarImage alt={session?.user.name} />
                  <AvatarFallback>{session?.user.name[0]}</AvatarFallback>
                </Avatar>
              </>
            )}
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{session?.user.name}</span>
              <span className="text-muted-foreground truncate text-xs">
                {session?.memberRole
                  ? memberRoleLabels[session?.memberRole as OrganizationRole]
                  : '-'}
              </span>
            </div>
            <ChevronsUpDown />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem render={<Link href={`/me`} />}>
                <User />
                Профиль
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                variant="destructive"
                disabled={isSignOutPending}
                onClick={() =>
                  mutate(undefined, {
                    onSuccess: () => {
                      router.push('/')
                    },
                  })
                }
              >
                <LogOut />
                Выйти
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
