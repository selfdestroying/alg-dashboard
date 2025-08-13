'use client'
import { UserData } from '@/actions/users'
import { sendEmail } from '@/utils/email'
import { toast } from 'sonner'
import { Textarea } from '../ui/textarea'

export default function FeedbackForm({
  user,
  onSubmit,
}: {
  user: UserData
  onSubmit?: () => void
}) {
  const handleSubmit = async (formData: FormData) => {
    const feedback = formData.get('feedback') as string
    const ok = sendEmail(user.firstName, feedback)

    toast.promise(ok, {
      loading: 'Отправка...',
      success: 'Отзыв отправлен',
      error: (e) => e.message,
    })
    onSubmit?.()
  }
  return (
    <form className="space-y-5" action={handleSubmit} id="feedback-form">
      <Textarea
        id="feedback"
        name="feedback"
        placeholder="Как мы можем улучшить панель управления?"
        aria-label="Send feedback"
      />
    </form>
  )
}
