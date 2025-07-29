import { useId } from 'react'
import { SidebarInput } from '@/components/ui/sidebar'
import { SidebarGroup, SidebarGroupContent } from '@/components/ui/sidebar'
import { Search } from 'lucide-react'

export function SearchForm({ ...props }: React.ComponentProps<'form'>) {
  const id = useId()

  return (
    <form {...props}>
      <SidebarGroup className="py-0">
        <SidebarGroupContent className="relative">
          <div className="relative">
            <SidebarInput
              disabled
              id={id}
              className="ps-9"
              aria-label="Search"
              placeholder="Поиск временно недоступен"
            />
            <div className="text-muted-foreground/60 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 peer-disabled:opacity-50">
              <Search size={20} aria-hidden="true" />
            </div>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    </form>
  )
}
