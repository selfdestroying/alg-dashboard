'use client'
import { logout } from '@/actions/auth'
import { UserData } from '@/actions/users'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { ChevronsUpDown, Loader, LogOut } from 'lucide-react'
import { useTransition } from 'react'

export default function NavUser({ user }: { user: UserData }) {
  const [isPending, startTransition] = useTransition()
  const handleLogout = () => {
    startTransition(() => {
      logout()
    })
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
            {isPending ? (
              <Loader className="animate-spin" />
            ) : (
              <>
                <Avatar>
                  <AvatarImage alt={user.firstName + ' ' + user.lastName} />
                  <AvatarFallback>
                    {user.firstName[0]}
                    {user.lastName ? user.lastName[0] : ''}
                  </AvatarFallback>
                </Avatar>
              </>
            )}
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">
                {user.firstName} {user.lastName}
              </span>
              <span className="text-muted-foreground truncate text-xs">{user.role.name}</span>
            </div>
            <ChevronsUpDown />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {/* <DropdownMenuGroup>
              <DropdownMenuItem render={<Link href={'/dashboard/profile'} />}>
                <User />
                Профиль
              </DropdownMenuItem>
            </DropdownMenuGroup> */}
            {/* <DropdownMenuSeparator /> */}
            <DropdownMenuGroup>
              <DropdownMenuItem variant="destructive" onClick={handleLogout} disabled={isPending}>
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
