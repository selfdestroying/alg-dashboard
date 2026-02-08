'use client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/src/components/ui/sidebar'
import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'

const themeNames: Record<string, React.ReactNode> = {
  light: <Sun />,
  dark: <Moon />,
  system: <Monitor />,
}

export default function NavTheme() {
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="sm"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              />
            }
          >
            {mounted && theme && themeNames[theme]}
            <span>Тема</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => setTheme('light')}>
                <Sun className="h-4 w-4" />
                Светлая
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <Moon className="h-4 w-4" />
                Тёмная
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                <Monitor />
                Системная
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
