'use client'
import { createCategory } from '@/actions/categories'
import { toast } from 'sonner'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

export default function CategoryForm() {
  const onSubmit = (formData: FormData) => {
    const name = formData.get('name') as string
    const ok = createCategory({ name })

    toast.promise(ok, {
      loading: 'Загрузка...',
      success: 'Категория успешно создана',
      error: (e) => e.message,
    })
  }

  return (
    <form id="category-form" action={onSubmit}>
      <Label htmlFor="name">Название категории</Label>
      <Input id="name" name="name" />
    </form>
  )
}
