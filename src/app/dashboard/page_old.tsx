// app/dashboard/page.tsx
import { CurrentLessons } from '@/components/current-lessons'

export default async function Page() {
  return (
    <div className="flex-1 space-y-4">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Активные уроки</h2>
        <p className="text-muted-foreground">
          Уроки, которые проходят сегодня, с подробной информацией о посещаемости.
        </p>
      </div>

      <div className="space-y-4">
        <CurrentLessons />
      </div>
    </div>
  )
}
