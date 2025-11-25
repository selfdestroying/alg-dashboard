// components/student-group-transfer-history-final.tsx
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { ArrowRight, Minus, Plus } from 'lucide-react'

type Transfer = {
  id: number
  date: Date
  type: 'enroll' | 'transfer' | 'leave'
  from?: string | null
  to?: string | null
  reason?: string
}

const transfers: Transfer[] = [
  { id: 1, date: new Date('2023-09-01'), type: 'enroll', to: 'Английский B1' },
  { id: 2, date: new Date('2023-09-01'), type: 'enroll', to: 'Математика 9 класс' },
  {
    id: 3,
    date: new Date('2024-06-15'),
    type: 'leave',
    from: 'Математика 9 класс',
    reason: 'окончание учебного года',
  },
  {
    id: 4,
    date: new Date('2024-09-01'),
    type: 'transfer',
    from: 'Английский B1',
    to: 'Английский B2 Intensive',
    reason: 'успешное завершение уровня',
  },
  { id: 5, date: new Date('2024-09-01'), type: 'enroll', to: 'Математика 10 класс' },
  {
    id: 6,
    date: new Date('2024-12-10'),
    type: 'leave',
    from: 'Математика 10 класс',
    reason: 'по заявлению родителей',
  },
  { id: 7, date: new Date('2025-01-15'), type: 'enroll', to: 'Подготовка к ЕГЭ (профиль)' },
].sort((a, b) => b.date.getTime() - a.date.getTime())

// Вычисляем текущие группы
const activeGroups = new Set<string>()
transfers.forEach((t) => {
  if (t.type === 'enroll' || t.type === 'transfer') activeGroups.add(t.to!)
  if (t.type === 'leave' || t.type === 'transfer') activeGroups.delete(t.from!)
})

export function StudentGroupHistoryV4() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">История групп и переводов</h3>
        {/* <Badge variant="outline" className="font-mono">
          {activeGroups.size} активных
        </Badge> */}
      </div>

      <Separator />

      <div className="space-y-3">
        {transfers.map((t) => (
          <div
            key={t.id}
            className="border-muted/30 flex items-start gap-4 border-b py-2 text-sm last:border-0"
          >
            {/* Дата */}
            <div className="text-muted-foreground w-28 shrink-0 font-mono text-xs">
              {format(t.date, 'dd MMM yyyy', { locale: ru })}
            </div>

            {/* Событие */}
            <div className="flex flex-1 items-center gap-3">
              {/* Иконка события */}
              {t.type === 'enroll' && (
                <>
                  <div className="rounded-full bg-emerald-100 p-1.5">
                    <Plus className="h-4 w-4 text-emerald-700" />
                  </div>
                  <div>
                    <span className="font-medium">{t.to}</span>
                    <span className="text-muted-foreground"> — зачислен</span>
                  </div>
                </>
              )}

              {t.type === 'transfer' && t.from && t.to && (
                <>
                  <div className="rounded-full bg-blue-100 p-1.5">
                    <ArrowRight className="h-4 w-4 text-blue-700" />
                  </div>
                  <div>
                    <span className="text-muted-foreground line-through">{t.from}</span>
                    <ArrowRight className="text-muted-foreground mx-2 inline h-4 w-4" />
                    <span className="font-medium">{t.to}</span>
                    <span className="text-muted-foreground"> — перевод</span>
                  </div>
                </>
              )}

              {t.type === 'leave' && t.from && (
                <>
                  <div className="rounded-full bg-red-100 p-1.5">
                    <Minus className="h-4 w-4 text-red-700" />
                  </div>
                  <div>
                    <span className="text-muted-foreground line-through">{t.from}</span>
                    <span className="text-muted-foreground"> — отчислен</span>
                  </div>
                </>
              )}

              {/* Причина (если есть) */}
              {t.reason && <p className="text-muted-foreground mt-0.5 ml-9 text-xs">{t.reason}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
