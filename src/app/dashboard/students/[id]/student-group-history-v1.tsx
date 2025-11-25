// components/student-groups-timeline-adaptive.tsx
'use client'

import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Users, Globe, Calculator, Flame, CalendarDays } from 'lucide-react'
import { useMediaQuery } from 'react-responsive'

type Membership = {
  id: number
  group: string
  subject: 'english' | 'math' | 'exam'
  from: string // YYYY-MM
  to: string | null
}

const data: Membership[] = [
  { id: 1, group: 'Английский B1', subject: 'english', from: '2023-09', to: '2024-08' },
  { id: 2, group: 'Английский B2', subject: 'english', from: '2024-09', to: null },
  { id: 3, group: 'Математика 9 кл', subject: 'math', from: '2023-09', to: '2024-06' },
  { id: 4, group: 'Математика 10 кл', subject: 'math', from: '2024-09', to: null },
  { id: 5, group: 'Подготовка к ЕГЭ', subject: 'exam', from: '2025-01', to: null },
]

const subjectConfig = {
  english: { color: 'bg-purple-500', icon: Globe },
  math: { color: 'bg-blue-500', icon: Calculator },
  exam: { color: 'bg-amber-500', icon: Flame },
}

const startDate = new Date('2023-08-01')
const endDate = new Date('2025-08-01')
const totalMs = endDate.getTime() - startDate.getTime()

export function StudentGroupHistoryV1() {
  const isMobile = useMediaQuery({ maxWidth: 768 })
  const activeCount = data.filter((m) => !m.to).length

  // МОБИЛЬНАЯ ВЕРСИЯ — вертикальный список (красиво и читаемо)
  if (isMobile) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              Группы
            </CardTitle>
            <Badge variant="secondary">{activeCount} активных</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.map((item) => {
            const Icon = subjectConfig[item.subject].icon
            const from = new Date(item.from + '-01')
            const to = item.to ? new Date(item.to + '-01') : null
            const isActive = !item.to

            return (
              <div
                key={item.id}
                className={`flex items-center gap-3 rounded-lg border p-3 ${
                  isActive ? 'border-foreground/20 bg-foreground/5' : 'border-transparent'
                }`}
              >
                <div className={`rounded-full p-2 ${subjectConfig[item.subject].color}`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p
                    className={`font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}
                  >
                    {item.group}
                  </p>
                  <p className="text-muted-foreground mt-0.5 flex items-center gap-1 text-xs">
                    <CalendarDays className="h-3 w-3" />
                    {format(from, 'LLL yyyy', { locale: ru })}
                    {to ? ` → ${format(to, 'LLL yyyy', { locale: ru })}` : ' → сейчас'}
                  </p>
                </div>
                {isActive && <Badge className="text-xs">активна</Badge>}
              </div>
            )
          })}
        </CardContent>
      </Card>
    )
  }

  // ДЕСКТОПНАЯ ВЕРСИЯ — горизонтальный таймлайн
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            Группы по времени
          </CardTitle>
          <Badge variant="secondary">{activeCount} активных</Badge>
        </div>
      </CardHeader>

      <CardContent>
        <TooltipProvider>
          <div className="space-y-5">
            {data.map((item) => {
              const from = new Date(item.from + '-01')
              const to = item.to ? new Date(item.to + '-01') : endDate
              const Icon = subjectConfig[item.subject].icon

              const left = ((from.getTime() - startDate.getTime()) / totalMs) * 100
              const width = ((to.getTime() - from.getTime()) / totalMs) * 100
              const isActive = !item.to

              return (
                <div key={item.id} className="relative h-12">
                  <div className="bg-muted-foreground/20 absolute inset-x-0 top-6 h-px" />

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`absolute top-2 flex h-9 items-center rounded-full px-4 shadow-md transition-all ${subjectConfig[item.subject].color} ${!isActive && 'opacity-70'} cursor-pointer hover:scale-105 hover:shadow-lg`}
                        style={{
                          left: `${left}%`,
                          width: `${width}%`,
                          minWidth: '80px',
                        }}
                      >
                        <Icon className="mr-2 h-5 w-5 text-white" />
                        <span className="truncate text-sm font-medium text-white">
                          {item.group}
                        </span>
                        {isActive && (
                          <Badge className="ml-2 border-0 bg-white/30 text-xs text-white">
                            сейчас
                          </Badge>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-semibold">{item.group}</p>
                      <p className="text-xs">
                        {format(from, 'LLLL yyyy', { locale: ru })} —{' '}
                        {item.to ? format(to, 'LLLL yyyy', { locale: ru }) : 'по настоящее время'}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )
            })}

            {/* Ось времени */}
            <div className="border-muted-foreground/30 relative h-8 border-t pt-4">
              {['2023-09', '2024-01', '2024-06', '2024-09', '2025-01'].map((m) => {
                const date = new Date(m + '-01')
                const percent = ((date.getTime() - startDate.getTime()) / totalMs) * 100
                return (
                  <div
                    key={m}
                    className="text-muted-foreground absolute text-xs font-medium"
                    style={{ left: `${percent}%`, transform: 'translateX(-50%)' }}
                  >
                    {format(date, 'LLL yyyy', { locale: ru }).replace('.', '')}
                  </div>
                )
              })}
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  )
}
