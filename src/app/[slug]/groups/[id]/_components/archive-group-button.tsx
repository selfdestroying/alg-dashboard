'use client'

import { Alert, AlertDescription } from '@/src/components/ui/alert'
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
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from '@/src/components/ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover'
import { Switch } from '@/src/components/ui/switch'
import { Textarea } from '@/src/components/ui/textarea'
import { useArchiveGroupMutation, useFutureLessonsCountQuery } from '@/src/features/groups/queries'
import { moscowNow, normalizeDateOnly } from '@/src/lib/timezone'
import { ru } from 'date-fns/locale'
import { CalendarIcon, TriangleAlert } from 'lucide-react'
import { useState } from 'react'

interface ArchiveGroupButtonProps {
  groupId: number
  isOpen: boolean
  onClose: () => void
}

function getFullDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export default function ArchiveGroupDialog({ groupId, isOpen, onClose }: ArchiveGroupButtonProps) {
  const [archivedAt, setArchivedAt] = useState<Date | undefined>(undefined)
  const [comment, setComment] = useState('')
  const [deleteFutureLessons, setDeleteFutureLessons] = useState(false)

  const effectiveDate = getFullDateString(archivedAt ?? normalizeDateOnly(moscowNow()))

  const { data: futureLessonsCount, isLoading: isCountLoading } = useFutureLessonsCountQuery(
    groupId,
    effectiveDate,
    { enabled: isOpen },
  )

  const archiveMutation = useArchiveGroupMutation()

  const handleArchive = () => {
    archiveMutation.mutate(
      {
        groupId,
        archivedAt: getFullDateString(archivedAt ?? normalizeDateOnly(moscowNow())),
        comment: comment || undefined,
        deleteFutureLessons,
      },
      {
        onSuccess: () => {
          onClose()
        },
      },
    )
  }

  const handleOpenChange = (open: boolean) => {
    onClose()
    if (!open) {
      setArchivedAt(undefined)
      setComment('')
      setDeleteFutureLessons(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Архивировать группу</DialogTitle>
          <DialogDescription>
            Группа будет помечена как архивная и перестанет отображаться в выпадающих списках.
            Данные о посещаемости и история сохранятся.
          </DialogDescription>
        </DialogHeader>

        <FieldGroup className="gap-3">
          <Field>
            <FieldLabel>Дата архивации</FieldLabel>
            <Popover>
              <PopoverTrigger render={<Button variant="outline" className="w-full font-normal" />}>
                <CalendarIcon />
                {archivedAt
                  ? archivedAt.toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : 'Сегодня'}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  onSelect={setArchivedAt}
                  locale={ru}
                  selected={archivedAt}
                />
              </PopoverContent>
            </Popover>
          </Field>

          <Field>
            <FieldLabel>Комментарий</FieldLabel>
            <Textarea
              placeholder="Причина архивации (необязательно)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
            />
          </Field>

          <Field orientation="horizontal">
            <FieldLabel>
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>Удалить будущие уроки</FieldTitle>
                  <FieldDescription>
                    Уроки начиная с даты архивации будут удалены вместе с данными посещаемости
                  </FieldDescription>
                </FieldContent>
                <Switch checked={deleteFutureLessons} onCheckedChange={setDeleteFutureLessons} />
              </Field>
            </FieldLabel>
          </Field>

          {deleteFutureLessons && (
            <Alert>
              <TriangleAlert />
              <AlertDescription>
                {isCountLoading
                  ? 'Подсчёт уроков...'
                  : `Будет удалено ${futureLessonsCount ?? 0} ${getLessonWord(futureLessonsCount ?? 0)}`}
              </AlertDescription>
            </Alert>
          )}
        </FieldGroup>

        <DialogFooter>
          <DialogClose render={<Button variant="secondary" size="sm" />}>Отмена</DialogClose>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleArchive}
            disabled={archiveMutation.isPending}
          >
            Архивировать
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function getLessonWord(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod100 >= 11 && mod100 <= 19) return 'уроков'
  if (mod10 === 1) return 'урок'
  if (mod10 >= 2 && mod10 <= 4) return 'урока'
  return 'уроков'
}
