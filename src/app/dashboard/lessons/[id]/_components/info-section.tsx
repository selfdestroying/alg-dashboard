'use client'
import { updateLesson } from '@/actions/lessons'
import { timeSlots } from '@/components/forms/group-form'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useData } from '@/providers/data-provider'
import { Lesson, LessonStatus } from '@prisma/client'
import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { ru } from 'date-fns/locale'
import {
  BookOpen,
  CalendarIcon,
  Check,
  CircleDotDashed,
  Clock,
  Edit,
  Loader2,
  Users,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

const LessonStatusBadgeMap: Record<LessonStatus, 'info' | 'success' | 'error'> = {
  ACTIVE: 'success',
  CANCELLED: 'error',
}
const LessonStatusTextMap: Record<LessonStatus, string> = {
  ACTIVE: 'Активен',
  CANCELLED: 'Отменен',
}

interface InfoSectionsProps {
  lesson: Lesson & {
    group: {
      id: number
      name: string
      _count: {
        students: number
      }
    }
  }
}

export default function InfoSection({ lesson }: InfoSectionsProps) {
  const [editMode, setEditMode] = useState(false)
  const [timeSlot, setTimeSlot] = useState<(typeof timeSlots)[number] | null>(
    lesson.time ? { time: lesson.time } : null
  )
  const [date, setDate] = useState<Date | undefined>(lesson.date)
  const [status, setStatus] = useState<LessonStatus>(lesson.status)
  const { user } = useData()

  const [isPending, startTransition] = useTransition()

  const handleCancelEdit = () => {
    setEditMode(false)
    setTimeSlot(lesson.time ? { time: lesson.time } : null)
    setDate(lesson.date)
    setStatus(lesson.status)
  }

  const handleSaveEdit = () => {
    startTransition(() => {
      const ok = updateLesson({
        where: { id: lesson.id },
        data: {
          time: timeSlot?.time,
          date: date,
          status: status,
        },
      })
      toast.promise(ok, {
        loading: 'Сохранение изменений...',
        success: 'Изменения успешно сохранены',
        error: (e) => e.message,
      })
      setEditMode(false)
    })
  }

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="flex flex-row items-center justify-between">
          Информация об уроке
          {user?.role !== 'TEACHER' &&
            (editMode ? (
              <div className="flex gap-2">
                <Button
                  size={'sm'}
                  variant={'ghost'}
                  onClick={handleCancelEdit}
                  disabled={isPending}
                >
                  {isPending ? <Loader2 className="animate-spin" /> : <X />}
                  <span className="hidden sm:inline">Отмена</span>
                </Button>
                <Button
                  size={'sm'}
                  onClick={handleSaveEdit}
                  disabled={
                    isPending ||
                    (timeSlot?.time === lesson.time &&
                      date === lesson.date &&
                      status === lesson.status)
                  }
                >
                  {isPending ? <Loader2 className="animate-spin" /> : <Check />}
                  <span className="hidden sm:inline">Сохранить</span>
                </Button>
              </div>
            ) : (
              <Button size={'sm'} variant={'outline'} onClick={() => setEditMode(!editMode)}>
                <Edit />
                <span className="hidden lg:inline">Редактировать</span>
              </Button>
            ))}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-2">
          <div className="space-y-1">
            <div className="text-muted-foreground/60 flex items-center gap-1 truncate overflow-hidden text-xs font-medium tracking-wide uppercase">
              <BookOpen className="h-3 w-3" />
              Группа
            </div>
            <Button asChild variant={'link'} className="h-fit p-0 font-medium">
              <Link href={`/dashboard/groups/${lesson.group.id}`}>{lesson.group.name}</Link>
            </Button>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground/60 flex items-center gap-1 truncate text-xs font-medium tracking-wide uppercase">
              <Users className="h-3 w-3" />
              Количество учеников
            </div>
            <p className="text-sm font-semibold">{lesson.group._count.students}/12</p>
          </div>
        </div>
        <div className="my-4 grid grid-cols-2">
          <div className="space-y-1">
            <div className="text-muted-foreground/60 flex items-center gap-1 truncate text-xs font-medium tracking-wide uppercase">
              <CalendarIcon className="h-3 w-3" />
              Дата
            </div>
            {editMode ? (
              <Popover>
                <PopoverTrigger asChild disabled={isPending}>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal"
                    size={'sm'}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'dd.MM.yyyy') : 'Выбрать дату'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={setDate} locale={ru} />
                </PopoverContent>
              </Popover>
            ) : (
              <p className="text-sm font-semibold">
                {toZonedTime(lesson.date, 'Europe/Moscow').toLocaleDateString('ru-RU', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground/60 flex items-center gap-1 truncate text-xs font-medium tracking-wide uppercase">
              <Clock className="h-3 w-3" />
              Время
            </div>
            {editMode ? (
              <Select
                onValueChange={(value) => setTimeSlot({ time: value })}
                value={timeSlot?.time || ''}
                disabled={isPending}
              >
                <SelectTrigger size="sm">
                  <Clock className="h-3 w-3" />
                  <SelectValue placeholder="Выберите время" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot.time} value={slot.time}>
                      {slot.time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm font-semibold">{timeSlot?.time}</p>
            )}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-muted-foreground/60 flex items-center gap-1 truncate text-xs font-medium tracking-wide uppercase">
            <CircleDotDashed className="h-3 w-3" />
            Статус
          </div>
          {editMode ? (
            <Select
              defaultValue={status}
              onValueChange={(e: LessonStatus) => setStatus(e)}
              disabled={isPending}
            >
              <SelectTrigger size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={LessonStatus.ACTIVE}>
                  <div className="space-x-2">
                    <div
                      className="inline-block size-2 rounded-full bg-emerald-700 dark:bg-emerald-300"
                      aria-hidden="true"
                    ></div>
                    <span>Активный</span>
                  </div>
                </SelectItem>
                <SelectItem value={LessonStatus.CANCELLED}>
                  <div className="space-x-2">
                    <div
                      className="inline-block size-2 rounded-full bg-red-700 dark:bg-red-300"
                      aria-hidden="true"
                    ></div>
                    <span>Отменённый</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Badge variant={LessonStatusBadgeMap[status]}>{LessonStatusTextMap[status]}</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
