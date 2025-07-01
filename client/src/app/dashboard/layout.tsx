import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { getUser } from '@/lib/dal'
import { ModeToggle } from '@/components/ui/mode-toggle'
import { Button } from '@/components/ui/button'
import { MessageCircleQuestion } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import AppSidebar from '@/components/app-sidebar'
import FeedbackForm from '@/components/feedback-form'
import { redirect } from 'next/navigation'

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await getUser()
  if (!user) {
    return redirect('/auth')
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="w-full p-4">
        <header>
          <div className="mb-4 flex justify-between items-center">
            <SidebarTrigger variant={'outline'} className="cursor-pointer" />
            <Dialog>
              <DialogTrigger asChild disabled={!user}>
                <Button className="cursor-pointer" variant={'outline'} size={'sm'}>
                  <MessageCircleQuestion />
                  Обратная связь
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader className="space-y-2">
                  <DialogTitle>Обратная связь</DialogTitle>
                  <ul className="list-disc list-inside text-muted-foreground">
                    <DialogDescription>
                      <li>Пожелания по улучшению</li>
                    </DialogDescription>
                    <DialogDescription>
                      <li>Описание ошибок или багов</li>
                    </DialogDescription>
                    <DialogDescription>
                      <li>Просто приятные слова ;)</li>
                    </DialogDescription>
                  </ul>
                </DialogHeader>
                {user && <FeedbackForm user={user} />}
              </DialogContent>
            </Dialog>
            <ModeToggle />
          </div>
        </header>
        <main>{children}</main>
      </div>
    </SidebarProvider>
  )
}
