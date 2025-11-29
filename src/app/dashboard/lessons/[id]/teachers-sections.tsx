'use client'
import { updateDataMock } from '@/actions/attendance'
import { addTeacherToLesson, removeTeacherFromLesson } from '@/actions/lessons'
import { UserData } from '@/actions/users'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useData } from '@/providers/data-provider'
import { GroupType, Prisma } from '@prisma/client'
import { Check, Loader2, Plus, Trash2, X } from 'lucide-react'
import { useId, useState, useTransition } from 'react'
import { toast } from 'sonner'

interface TeachersSectionProps {
  lesson: Prisma.LessonGetPayload<{ include: { group: true } }>
  teachers: UserData[]
  currentTeachers: ({ teacher: UserData } & {
    teacherId: number
    lessonId: number
  })[]
}

const bidMap: Record<GroupType, 'bidForLesson' | 'bidForIndividual'> = {
  GROUP: 'bidForLesson',
  INDIVIDUAL: 'bidForIndividual',
  INTENSIVE: 'bidForIndividual',
}

export default function TeachersSection({
  lesson,
  teachers,
  currentTeachers,
}: TeachersSectionProps) {
  const id = useId()
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false)
  const [isTeacherAddPending, startTeacherAddTransition] = useTransition()
  const { user } = useData()

  const handleTeacherAdd = (fullName: string) => {
    startTeacherAddTransition(() => {
      const teacherId = teachers.find(
        (teacher) => `${teacher.firstName} ${teacher.lastName}` === fullName
      )!.id
      const ok = addTeacherToLesson({
        data: { lessonId: lesson.id, teacherId },
      })
      toast.promise(ok, {
        loading: 'Загрузка...',
        success: 'Учитель успешно добавлен в урок',
        error: (e) => e.message,
      })
      setPopoverOpen(false)
    })
  }

  const handleTeacherAddSelf = () => {
    startTeacherAddTransition(() => {
      const ok = addTeacherToLesson({
        data: { lessonId: lesson.id, teacherId: user!.id },
      })
      toast.promise(ok, {
        loading: 'Загрузка...',
        success: 'Учитель успешно добавлен в урок',
        error: (e) => e.message,
      })
    })
  }

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Преподаватели
          {user?.role === 'TEACHER' ? (
            !currentTeachers.map((teacher) => teacher.teacherId).includes(user!.id) && (
              <Button
                size={'sm'}
                onClick={handleTeacherAddSelf}
                disabled={isTeacherAddPending}
                variant={'outline'}
              >
                {isTeacherAddPending ? <Loader2 className="animate-spin" /> : <Plus />}
                <span className="hidden lg:inline">Добавить себя</span>
              </Button>
            )
          ) : (
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen} modal>
              <PopoverTrigger asChild>
                <Button
                  id={id}
                  variant="outline"
                  role="combobox"
                  aria-expanded={popoverOpen}
                  size={'sm'}
                  disabled={isTeacherAddPending}
                >
                  {isTeacherAddPending ? <Loader2 className="animate-spin" /> : <Plus />}
                  <span className="hidden lg:inline">Добавить учителя</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0"
                align="end"
              >
                <Command>
                  <CommandInput placeholder="Выберите группу..." />
                  <CommandList>
                    <CommandEmpty>Учителя не найдены</CommandEmpty>
                    <CommandGroup>
                      {teachers.map((teacher) => (
                        <CommandItem
                          key={teacher.id}
                          value={`${teacher.firstName} ${teacher.lastName}`}
                          onSelect={(currentValue) => handleTeacherAdd(currentValue)}
                        >
                          {teacher.firstName} {teacher.lastName}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {currentTeachers.map((teacher) => (
          <TeacherBidCar
            teacher={teacher.teacher}
            lessonId={lesson.id}
            key={teacher.teacherId}
            lessonType={lesson.group.type || 'INTENSIVE'}
          />
        ))}
      </CardContent>
    </Card>
  )
}

function TeacherBidCar({
  teacher,
  lessonId,
  lessonType,
}: {
  teacher: UserData
  lessonId: number
  lessonType: GroupType
}) {
  const [isTeacherDeletePending, startTeacherDeleteTransition] = useTransition()
  const [isTeacherBidEditPending, startTeacherBidEditTransition] = useTransition()
  const [editMode, setEditMode] = useState<boolean>(false)
  const [bid, setBid] = useState<number>(teacher[bidMap[lessonType]])
  const { user } = useData()

  const handleTeacherDelete = () => {
    startTeacherDeleteTransition(() => {
      const ok = removeTeacherFromLesson({
        where: {
          teacherId_lessonId: {
            teacherId: teacher.id,
            lessonId,
          },
        },
      })
      toast.promise(ok, {
        loading: 'Загрузка...',
        success: 'Учитель успешно удален из урока',
        error: (e) => e.message,
      })
    })
  }

  const handleCancelEdit = () => {
    setEditMode(false)
    setBid(teacher.bidForLesson)
  }
  const handleSaveEdit = () => {
    startTeacherBidEditTransition(async () => {
      await updateDataMock()
      setEditMode(false)
    })
  }

  return (
    <div key={teacher.id} className="flex items-center justify-between gap-2 rounded-lg border p-2">
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
        <p className="truncate text-sm font-medium">
          {teacher.firstName} {teacher.lastName}
        </p>

        <div className="flex items-center gap-2">
          {editMode ? (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={bid}
                className="h-8 w-24 text-sm"
                min={0}
                onChange={(e) => setBid(Number(e.target.value))}
                disabled={isTeacherBidEditPending || isTeacherDeletePending}
              />
              <span className="text-muted-foreground text-sm">₽</span>
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={handleSaveEdit}
                disabled={isTeacherBidEditPending}
                className="hover:bg-emerald-100 hover:dark:bg-emerald-900/20"
              >
                {isTeacherBidEditPending ? (
                  <Loader2 className="animate-spin text-emerald-700 dark:text-emerald-300" />
                ) : (
                  <Check className="text-emerald-700 dark:text-emerald-300" />
                )}
              </Button>
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={handleCancelEdit}
                disabled={isTeacherBidEditPending}
                className="hover:bg-red-100 hover:dark:bg-red-900/20"
              >
                {isTeacherBidEditPending ? (
                  <Loader2 className="animate-spin text-red-700 dark:text-red-300" />
                ) : (
                  <X className="text-red-700 dark:text-red-300" />
                )}
              </Button>
            </div>
          ) : (
            <>
              {(((user?.role === 'TEACHER' || user?.role === 'MANAGER') &&
                user.id === teacher.id) ||
                user?.role === 'OWNER' ||
                user?.role === 'ADMIN') && (
                <>
                  <span className="text-muted-foreground text-sm">Ставка:</span>
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    {teacher[bidMap[lessonType]].toLocaleString('ru-RU')} ₽
                  </span>
                </>
              )}
              {/* <Button size="icon-sm" variant="ghost" onClick={() => setEditMode(true)}>
                <Edit />
              </Button> */}
            </>
          )}
        </div>
      </div>
      {user?.role === 'TEACHER' ? (
        user.id === teacher.id && (
          <Button
            variant={'ghost'}
            className="hover:bg-red-100 hover:dark:bg-red-900/20"
            size={'icon-sm'}
            onClick={handleTeacherDelete}
            disabled={isTeacherDeletePending || isTeacherBidEditPending}
          >
            {isTeacherDeletePending || isTeacherBidEditPending ? (
              <Loader2 className="animate-spin text-red-700 dark:text-red-300" />
            ) : (
              <Trash2 className="text-red-700 dark:text-red-300" />
            )}
          </Button>
        )
      ) : (
        <Button
          variant={'ghost'}
          className="hover:bg-red-100 hover:dark:bg-red-900/20"
          size={'icon-sm'}
          onClick={handleTeacherDelete}
          disabled={isTeacherDeletePending || isTeacherBidEditPending}
        >
          {isTeacherDeletePending || isTeacherBidEditPending ? (
            <Loader2 className="animate-spin text-red-700 dark:text-red-300" />
          ) : (
            <Trash2 className="text-red-700 dark:text-red-300" />
          )}
        </Button>
      )}
    </div>
  )
}
