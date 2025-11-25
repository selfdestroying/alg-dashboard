// components/student-groups-compact-pro.tsx
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

import { Globe, Calculator, Flame, CheckCircle2 } from 'lucide-react'

const groups = [
  {
    id: 1,
    name: 'Английский B2 Intensive',
    subject: 'english',
    since: 'сен 2024',
    level: 'B2',
    progress: 85,
    active: true,
  },
  {
    id: 2,
    name: 'Математика 10 класс',
    subject: 'math',
    since: 'сен 2024',
    level: '10 кл',
    progress: 70,
    active: true,
  },
  {
    id: 3,
    name: 'Подготовка к ЕГЭ (профиль)',
    subject: 'exam',
    since: 'янв 2025',
    level: 'ЕГЭ',
    progress: 15,
    active: true,
  },
  {
    id: 4,
    name: 'Английский B1',
    subject: 'english',
    since: 'сен 2023',
    to: 'авг 2024',
    active: false,
  },
  {
    id: 5,
    name: 'Математика 9 класс',
    subject: 'math',
    since: 'сен 2023',
    to: 'июн 2024',
    active: false,
  },
]

const icons = { english: Globe, math: Calculator, exam: Flame }
const colors = {
  english: 'bg-purple-500/15 text-purple-700 border-purple-200',
  math: 'bg-blue-500/15 text-blue-700 border-blue-200',
  exam: 'bg-amber-500/15 text-amber-700 border-amber-200',
}

export function StudentGroupHistoryV2() {
  const activeCount = groups.filter((g) => g.active).length

  return (
    <div className="space-y-3">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Группы</h3>
        <Badge variant="secondary" className="font-medium">
          {activeCount} активных
        </Badge>
      </div>

      {/* Список групп */}
      <div className="space-y-2.5">
        {groups.map((g) => {
          const Icon = icons[g.subject]
          return (
            <div
              key={g.id}
              className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
                g.active
                  ? 'bg-card border-foreground/10 shadow-sm hover:shadow-md'
                  : 'bg-muted/30 opacity-70'
              }`}
            >
              {/* Иконка предмета */}
              <div className={`rounded-lg p-2.5 ${colors[g.subject]} border`}>
                <Icon className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`truncate font-medium ${g.active ? '' : 'text-muted-foreground'}`}
                  >
                    {g.name}
                  </span>
                  {g.active && <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-500" />}
                </div>
                <div className="text-muted-foreground mt-1 flex items-center gap-3 text-xs">
                  <span>
                    {g.since}
                    {g.to && ` – ${g.to}`}
                  </span>
                  {g.level && (
                    <Badge variant="outline" className="text-xs">
                      {g.level}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Прогресс-бар только у активных */}
              {g.active && g.progress !== undefined && (
                <div className="w-20">
                  <Progress value={g.progress} className="h-1.5" />
                  <span className="text-muted-foreground mt-1 block text-right text-xs">
                    {g.progress}%
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
