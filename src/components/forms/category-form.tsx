'use client'
import { createCategory } from '@/actions/categories'
import { toast } from 'sonner'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

export default function CategoryForm({ onSubmit }: { onSubmit?: () => void }) {
  const handleSubmit = (formData: FormData) => {
    const name = formData.get('name') as string
    const ok = createCategory({ name })

    toast.promise(ok, {
      loading: 'Загрузка...',
      success: 'Категория успешно создана',
      error: (e) => e.message,
    })
    onSubmit?.()
  }

  return (
    <form id="category-form" action={handleSubmit}>
      <Label htmlFor="name">Название категории</Label>
      <Input id="name" name="name" />
    </form>
  )
}
