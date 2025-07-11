import { getUser } from '@/actions/auth'
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
import { deleteSession } from '@/actions/session'
import { redirect } from 'next/navigation'

export async function NavUser() {
  const user = await getUser()
  if (!user) {
    return redirect('/auth')
  }
  const onLogout = async () => {
    'use server'
    await deleteSession()
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
                <AvatarImage alt={user.name} />
                <AvatarFallback className="rounded-lg">{user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-2 text-left text-sm">
                <span className="truncate font-medium">{user.name}</span>
                <Badge variant={'outline'}>{user.role}</Badge>
              </div>
              <ChevronsUpDown className="ml-auto size-5 text-muted-foreground/80" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) dark bg-sidebar"
            side="top"
            align="start"
          >
            <DropdownMenuGroup>
              <DropdownMenuItem className="gap-3 focus:bg-sidebar-accent" onClick={onLogout}>
                <ArrowLeftRight size={20} className="size-5 text-muted-foreground/80" />
                Сменить аккаунт
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
