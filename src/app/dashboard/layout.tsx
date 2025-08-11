import { getUser } from '@/actions/users'
import { AppSidebar } from '@/components/app-sidebar'
import ButtonDialog from '@/components/button-dialog'
import FeedbackForm from '@/components/forms/feedback-form'
import { ModeToggle } from '@/components/mode-toggle'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { redirect } from 'next/navigation'

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await getUser()
  if (!user) {
    return redirect('/auth')
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-hidden px-4 md:px-6 lg:px-8">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex flex-1 items-center gap-2">
            <SidebarTrigger variant={'outline'} />
            {/* <MyBreadCrumbs /> */}
          </div>
          <div className="ml-auto flex items-center gap-3">
            <ModeToggle />
            <ButtonDialog
              title="Отправить отзыв"
              description="Пожелания по улучшению, описание ошибок или багов"
              triggerButtonProps={{ variant: 'outline', size: 'sm', className: 'h-7' }}
              submitButtonProps={{ form: 'feedback-form' }}
            >
              <FeedbackForm user={user} />
            </ButtonDialog>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 py-4 lg:gap-6 lg:py-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
