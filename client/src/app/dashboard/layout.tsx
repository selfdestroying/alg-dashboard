import { AppSidebar } from '@/components/app-sidebar'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import FeedbackDialog from '@/components/dialogs/feedback-dialog'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import UserDropdown from '@/components/user-dropdown'
import { Separator } from '@radix-ui/react-separator'
import MyBreadCrumbs from '@/components/breadcrumbs'

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-hidden px-4 md:px-6 lg:px-8">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex flex-1 items-center gap-2">
            <SidebarTrigger />
            <MyBreadCrumbs />
          </div>
          <div className="ml-auto flex gap-3">
            <FeedbackDialog />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 py-4 lg:gap-6 lg:py-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
