import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { ArrowLeftRight, ChevronsUpDown } from 'lucide-react'
import { Badge } from './ui/badge'
import { redirect } from 'next/navigation'
import { getUser } from '@/actions/users'
import { signout } from '@/actions/auth'

export async function NavUser() {
  const user = await getUser()
  if (!user) {
    return redirect('/auth')
  }
  const onLogout = async () => {
    'use server'
    await signout()
  }
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground [&>svg]:size-5"
            >
              <Avatar className="size-8">
                <AvatarImage alt={user.firstName} />
                <AvatarFallback className="rounded-lg">{user.firstName[0]}</AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-2 text-left text-sm">
                <span className="truncate font-medium">{user.firstName}</span>
                <Badge variant={'outline'}>{user.role}</Badge>
              </div>
              <ChevronsUpDown className="text-muted-foreground/80 ml-auto size-5" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="dark bg-sidebar w-(--radix-dropdown-menu-trigger-width)"
            side="top"
            align="start"
          >
            <DropdownMenuGroup>
              <DropdownMenuItem className="focus:bg-sidebar-accent gap-3" onClick={onLogout}>
                <ArrowLeftRight size={20} className="text-muted-foreground/80 size-5" />
                Сменить аккаунт
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
