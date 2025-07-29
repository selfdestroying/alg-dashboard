'use client'
import { UserData } from '@/actions/users'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/dialogs/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { sendEmail } from '@/utils/email'
import { toast } from 'sonner'

export default function FeedbackDialog({ user }: { user: UserData }) {
  const onSubmit = (formData: FormData) => {
    const feedback = formData.get('feedback') as string
    console.log(feedback)
    const ok = sendEmail(user.firstName, feedback)

    toast.promise(ok, {
      loading: 'Отправка...',
      success: 'Отзыв отправлен',
      error: (e) => e.message,
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-sm">
          Отзыв
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Отправить отзыв</DialogTitle>
          <DialogDescription>Пожелания по улучшению, описание ошибок или багов</DialogDescription>
        </DialogHeader>
        <form className="space-y-5" action={onSubmit}>
          <Textarea
            id="feedback"
            name="feedback"
            placeholder="Как мы можем улучшить панель управления?"
            aria-label="Send feedback"
          />
          <div className="flex flex-col sm:flex-row sm:justify-end">
            <Button type="submit">Отправить</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
