'use client'

import { StudentFinancialField, StudentLessonsBalanceChangeReason } from '@/prisma/generated/enums'
import {
  AttendanceWithStudents,
  createAttendance,
  deleteAttendance,
} from '@/src/actions/attendance'
import { CustomCombobox } from '@/src/components/custom-combobox'
import { Button } from '@/src/components/ui/button'
import { Calendar } from '@/src/components/ui/calendar'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog'
import { Field, FieldContent, FieldLabel, FieldTitle } from '@/src/components/ui/field'
import { Item, ItemContent, ItemDescription, ItemTitle } from '@/src/components/ui/item'
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover'
import { Switch } from '@/src/components/ui/switch'
import { useLessonListQuery } from '@/src/data/lesson/lesson-list-query'
import { useSessionQuery } from '@/src/data/user/session-query'
import { updateStudentGroupBalance } from '@/src/features/students/actions'
import { cn, getFullName, getGroupName } from '@/src/lib/utils'
import { startOfDay } from 'date-fns'
import { ru } from 'date-fns/locale/ru'
import { CalendarIcon, Loader } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'

interface MakeUpDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  attendance: AttendanceWithStudents
}

export default function MakeUpDialog({ open, onOpenChange, attendance }: MakeUpDialogProps) {
  const { data: session } = useSessionQuery()
  const organizationId = session?.organizationId
  const [selectedDay, setSelectedDay] = useState<Date | undefined>()
  const dayKey = useMemo(() => selectedDay && startOfDay(selectedDay), [selectedDay])
  const { data: lessons } = useLessonListQuery(organizationId!, dayKey)

  const isReschedule = !!attendance.makeupAttendance

  const [selectedLesson, setSelectedLesson] = useState<NonNullable<typeof lessons>[number] | null>(
    null,
  )
  const [creditBalance, setCreditBalance] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetForm = useCallback(() => {
    setSelectedDay(undefined)
    setSelectedLesson(null)
    setCreditBalance(true)
  }, [])

  const handleOpenChange = useCallback(
    (value: boolean) => {
      if (!value) resetForm()
      onOpenChange(value)
    },
    [onOpenChange, resetForm],
  )

  const handleCreate = async () => {
    if (!selectedLesson || !organizationId) return

    const newAttendance = await createAttendance({
      organizationId,
      studentId: attendance.studentId,
      lessonId: selectedLesson.id,
      comment: '',
      status: 'UNSPECIFIED',
      makeupForAttendanceId: attendance.id,
    })

    if (creditBalance) {
      const originalGroupId = attendance.lesson.groupId

      await updateStudentGroupBalance({
        studentId: attendance.studentId,
        groupId: originalGroupId,
        data: { lessonsBalance: { increment: 1 } },
        audit: {
          [StudentFinancialField.LESSONS_BALANCE]: {
            reason: StudentLessonsBalanceChangeReason.MAKEUP_GRANTED,
            meta: {
              missedAttendanceId: attendance.id,
              makeUpAttendanceId: newAttendance.id,
              makeUpLessonId: selectedLesson.id,
              makeUpLessonName: getGroupName(selectedLesson.group),
              originalGroupId,
            },
          },
        },
      })
    }
  }

  const handleReschedule = async () => {
    if (!selectedLesson || !organizationId || !attendance.makeupAttendance) return

    // Удаляем старую attendance отработки — связь удалится вместе с записью
    await deleteAttendance({
      where: { id: attendance.makeupAttendance.id },
    })

    // Создаём новую attendance + привязываем к пропуску
    await createAttendance({
      organizationId,
      studentId: attendance.studentId,
      lessonId: selectedLesson.id,
      comment: '',
      status: 'UNSPECIFIED',
      makeupForAttendanceId: attendance.id,
    })
  }

  const handleSubmit = async () => {
    if (!selectedLesson || !organizationId) {
      toast.error('Пожалуйста, выберите урок для отработки.')
      return
    }

    setIsSubmitting(true)

    toast.promise(isReschedule ? handleReschedule() : handleCreate(), {
      loading: 'Сохраняем...',
      success: () => {
        handleOpenChange(false)
        return isReschedule ? 'Дата отработки изменена' : 'Отработка успешно создана'
      },
      error: (e) => e.message,
      finally: () => setIsSubmitting(false),
    })
  }

  const studentName = getFullName(attendance.student.firstName, attendance.student.lastName)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isReschedule ? 'Изменить дату отработки' : 'Записать на отработку'}
          </DialogTitle>
          <DialogDescription>{studentName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Popover>
            <PopoverTrigger render={<Button variant="outline" className="w-full font-normal" />}>
              <CalendarIcon />
              {selectedDay
                ? selectedDay.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
                : 'Выберите день'}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                onSelect={setSelectedDay}
                locale={ru}
                selected={selectedDay}
              />
            </PopoverContent>
          </Popover>

          <CustomCombobox
            items={lessons || []}
            getKey={(l) => l.id}
            getLabel={(l) => getGroupName(l.group)}
            value={selectedLesson}
            onValueChange={setSelectedLesson}
            placeholder="Выберите урок"
            emptyText="Не найдено уроков на эту дату"
            itemDisabled={(l) => l.attendance.length >= l.group.maxStudents}
            renderItem={(l) => (
              <Item size="xs" className="p-0">
                <ItemContent>
                  <ItemTitle className="whitespace-nowrap">{getGroupName(l.group)}</ItemTitle>
                  <ItemDescription>
                    {l.teachers.map((t) => t.teacher.name).join(', ')} | {l.group.location.name} |{' '}
                    <span
                      className={cn(
                        'tabular-nums',
                        l.attendance.length >= l.group.maxStudents && 'text-destructive',
                      )}
                    >
                      {l.attendance.length}/{l.group.maxStudents}
                    </span>
                  </ItemDescription>
                </ItemContent>
              </Item>
            )}
          />

          {!isReschedule && (
            <FieldLabel htmlFor="switch-credit-balance">
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>Начислить +1 к балансу</FieldTitle>
                </FieldContent>
                <Switch
                  id="switch-credit-balance"
                  checked={creditBalance}
                  onCheckedChange={(val) => setCreditBalance(val as boolean)}
                />
              </Field>
            </FieldLabel>
          )}
        </div>

        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>Отмена</DialogClose>
          <Button onClick={handleSubmit} disabled={isSubmitting || !selectedLesson}>
            {isSubmitting ? (
              <Loader className="animate-spin" />
            ) : isReschedule ? (
              'Изменить'
            ) : (
              'Создать'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
