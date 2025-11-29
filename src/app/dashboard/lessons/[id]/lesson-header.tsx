// components/LessonHeaderPro.tsx
'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import {
  CalendarIcon,
  Check,
  Clock,
  DollarSign,
  Edit2,
  Plus,
  Trash2,
  UserCheck,
  Users,
  X,
} from 'lucide-react'
import { useState } from 'react'

interface Teacher {
  id: string
  name: string
  rate: number
}

interface LessonHeaderProProps {
  group: string
  initialTime?: string
  initialStatus?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  initialDate?: Date
  initialStudentsCount?: number
  initialMaxStudents?: number
  initialTeachers?: Teacher[]
  onSave?: (data: any) => void
}

const statusOptions = {
  upcoming: 'Скоро начнётся',
  ongoing: 'Идёт сейчас',
  completed: 'Завершён',
  cancelled: 'Отменён',
} as const

export default function LessonHeaderPro({
  group,
  initialTime = '19:00–20:30',
  initialStatus = 'upcoming',
  initialDate = new Date(),
  initialStudentsCount = 12,
  initialMaxStudents = 15,
  initialTeachers = [
    { id: '1', name: 'Анна Иванова', rate: 2400 },
    { id: '2', name: 'Михаил Петров', rate: 2200 },
  ],
  onSave,
}: LessonHeaderProProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [time, setTime] = useState(initialTime)
  const [status, setStatus] = useState(initialStatus)
  const [date, setDate] = useState<Date>(initialDate)
  const [studentsCount, setStudentsCount] = useState(initialStudentsCount)
  const [maxStudents, setMaxStudents] = useState(initialMaxStudents)
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers)

  const addTeacher = () => {
    setTeachers([...teachers, { id: crypto.randomUUID(), name: '', rate: 0 }])
  }

  const updateTeacher = (id: string, field: 'name' | 'rate', value: string) => {
    setTeachers((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              [field]: field === 'rate' ? Number(value.replace(/\D/g, '')) || 0 : value,
            }
          : t
      )
    )
  }

  const removeTeacher = (id: string) => {
    if (teachers.length > 1) {
      setTeachers((prev) => prev.filter((t) => t.id !== id))
    }
  }

  const handleSave = () => {
    const validTeachers = teachers.filter((t) => t.name.trim())
    onSave?.({
      time,
      status,
      date,
      studentsCount,
      maxStudents: maxStudents || undefined,
      teachers: validTeachers,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setTime(initialTime)
    setStatus(initialStatus)
    setDate(initialDate)
    setStudentsCount(initialStudentsCount)
    setMaxStudents(initialMaxStudents)
    setTeachers(initialTeachers)
    setIsEditing(false)
  }

  const totalRate = teachers.reduce((sum, t) => sum + t.rate, 0)

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">{group}</h1>
          {isEditing ? (
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>
                <Check className="mr-1 h-4 w-4" /> Сохранить
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4" /> Отмена
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
              <Edit2 className="mr-1 h-4 w-4" /> Редактировать
            </Button>
          )}
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Левая часть */}
          <div className="space-y-5">
            <Badge
              variant={status === 'cancelled' ? 'destructive' : 'secondary'}
              className="text-sm"
            >
              <span
                className={cn('mr-2 h-2 w-2 rounded-full', {
                  'bg-blue-500': status === 'upcoming',
                  'bg-green-500': status === 'ongoing',
                  'bg-gray-400': status === 'completed',
                  'bg-red-500': status === 'cancelled',
                })}
              />
              {statusOptions[status]}
            </Badge>

            <div className="grid grid-cols-3 gap-4">
              {/* Дата с календарем */}
              <div className="space-y-1">
                <Label className="text-muted-foreground flex items-center gap-1 text-xs">
                  <CalendarIcon className="h-3.5 w-3.5" /> Дата Дата
                </Label>
                {isEditing ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'h-9 w-full justify-start text-left font-normal',
                          !date && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, 'd MMMM, EEE', { locale: ru }) : 'Выберите дату'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(d) => d && setDate(d)}
                        locale={ru}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                ) : (
                  <div className="font-medium">{format(date, 'd MMMM, EEE', { locale: ru })}</div>
                )}
              </div>

              {/* Время */}
              <div className="space-y-1">
                <Label className="text-muted-foreground flex items-center gap-1 text-xs">
                  <Clock className="h-3.5 w-3.5" /> Время
                </Label>
                {isEditing ? (
                  <Input value={time} onChange={(e) => setTime(e.target.value)} className="h-9" />
                ) : (
                  <div className="text-foreground font-medium">{time}</div>
                )}
              </div>

              {/* Ученики */}
              <div className="space-y-1">
                <Label className="text-muted-foreground flex items-center gap-1 text-xs">
                  <Users className="h-3.5 w-3.5" /> Ученики
                </Label>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={studentsCount}
                      onChange={(e) => setStudentsCount(Number(e.target.value))}
                      className="h-9 w-20"
                    />
                    <span className="text-muted-foreground">/</span>
                    <Input
                      type="number"
                      value={maxStudents}
                      onChange={(e) => setMaxStudents(Number(e.target.value) || 0)}
                      className="h-9 w-20"
                      placeholder="15"
                    />
                  </div>
                ) : (
                  <div>
                    {studentsCount} / {maxStudents}
                  </div>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">Статус урока</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusOptions).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Правая часть — преподаватели */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <UserCheck className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground">Преподаватели</span>
              </div>
              {isEditing && (
                <Button size="sm" variant="ghost" onClick={addTeacher} className="h-8">
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {teachers.map((teacher) => (
                <div key={teacher.id} className="flex items-center gap-3">
                  <Input
                    value={teacher.name}
                    onChange={(e) => updateTeacher(teacher.id, 'name', e.target.value)}
                    placeholder="Имя преподавателя"
                    className="h-9"
                    disabled={!isEditing}
                  />
                  <div className="flex items-center gap-2">
                    <DollarSign className="text-muted-foreground h-4 w-4" />
                    <Input
                      type="text"
                      value={teacher.rate.toLocaleString('ru-RU')}
                      onChange={(e) => updateTeacher(teacher.id, 'rate', e.target.value)}
                      className="h-9 w-32 text-right"
                      disabled={!isEditing}
                      placeholder="0"
                    />
                  </div>
                  {isEditing && teachers.length > 1 && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive h-9 w-9"
                      onClick={() => removeTeacher(teacher.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {teachers.length > 1 && (
              <>
                <Separator />
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-muted-foreground">Итого:</span>
                  <span>{totalRate.toLocaleString('ru-RU')} ₽</span>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
