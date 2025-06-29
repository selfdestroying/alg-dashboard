'use client'
import { IUser } from '@/types/user'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { toast } from 'sonner'
import { sendEmail } from '@/lib/api/api-server'

export default function FeedbackForm({ user }: { user: IUser }) {
  const sendFeedback = (formData: FormData) => {
    const ok = new Promise<void>((resolve, reject) => {
      try {
        const feedback = formData.get('feedback') as string
        const name = formData.get('name') as string
        if (!feedback) {
          throw new Error('Заполните все поля.')
        }

        sendEmail(name, feedback).then(() => {
          resolve()
        })
      } catch (error) {
        let message = 'Unknown error occurred'
        if (error instanceof Error) {
          message = error.message
        }
        reject(message)
      }
    })
    toast.promise(ok, {
      loading: 'Отправка...',
      success: 'Отправлено',
      error: (message) => message,
    })
  }
  return (
    <form action={sendFeedback} className="space-y-2">
      <Input type="hidden" name="name" value={user!.name} />
      <Textarea placeholder="Плохо, переделывай!" name="feedback" />
      <div className="flex justify-end">
        <Button className="cursor-pointer">Отправить</Button>
      </div>
    </form>
  )
}
