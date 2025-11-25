// components/student-group-history-minimal.tsx
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Check, X } from 'lucide-react'

// Одна запись = один период в одной группе
const history = [
  { group: 'Английский B2 Intensive', from: '2024-09-01', to: null, active: true },
  { group: 'Математика 10 класс', from: '2024-09-01', to: null, active: true },
  { group: 'Подготовка к ЕГЭ', from: '2025-01-01', to: null, active: true },
  { group: 'Английский B1', from: '2023-09-01', to: '2024-08-31', active: false },
  { group: 'Математика 9 класс', from: '2023-09-01', to: '2024-06-30', active: false },
].sort((a, b) => (b.to || '9999-99-99').localeCompare(a.to || '9999-99-99'))

export function StudentGroupHistoryV3() {
  const activeCount = history.filter((h) => h.active).length

  return (
    <div className="space-y-4">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">История групп</h3>
        <Badge variant="outline" className="font-mono">
          {activeCount} активн.
        </Badge>
      </div>

      <Separator />

      {/* Список */}
      <div className="space-y-2.5 text-sm">
        {history.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-between rounded-md px-1 py-2 transition-colors ${
              item.active ? 'bg-accent/30 font-medium' : 'text-muted-foreground'
            }`}
          >
            <span className="truncate pr-4">{item.group}</span>

            <div className="flex items-center gap-3 font-mono text-xs">
              <span>{format(new Date(item.from), 'dd.MM.yyyy', { locale: ru })}</span>
              <span className="text-muted-foreground">→</span>
              <span>
                {item.to ? format(new Date(item.to), 'dd.MM.yyyy', { locale: ru }) : 'наст. время'}
              </span>

              {item.active ? (
                <Check className="ml-2 h-4 w-4 text-emerald-600" />
              ) : (
                <X className="text-muted-foreground/40 ml-2 h-4 w-4" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
