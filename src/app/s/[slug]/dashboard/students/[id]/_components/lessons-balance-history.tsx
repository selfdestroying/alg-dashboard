'use client'
import {
  AttendanceStatus,
  StudentLessonsBalanceChangeReason,
  User,
} from '@/prisma/generated/client'
import { updateStudentBalanceHistory } from '@/src/actions/students'
import { Button } from '@/src/components/ui/button'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import { Field, FieldGroup, FieldLabel } from '@/src/components/ui/field'
import { Input } from '@/src/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table'
import { JsonValue } from '@prisma/client/runtime/client'
import { toZonedTime } from 'date-fns-tz'
import { MoreVertical } from 'lucide-react'
import Link from 'next/link'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

type HistoryRow = {
  id: number
  createdAt: Date
  reason: StudentLessonsBalanceChangeReason
  delta: number
  balanceBefore: number
  balanceAfter: number
  comment: string | null
  actorUser: User | null
  meta: JsonValue | null
}

const reasonLabel: Record<StudentLessonsBalanceChangeReason, string> = {
  PAYMENT_CREATED: 'Оплата (начисление уроков)',
  PAYMENT_CANCELLED: 'Отмена оплаты (списание уроков)',
  ATTENDANCE_PRESENT_CHARGED: 'Посещение (списание урока)',
  ATTENDANCE_ABSENT_CHARGED: 'Пропуск (списание урока)',
  MAKEUP_ATTENDED_CHARGED: 'Посещение отработки (списание урока)',
  ATTENDANCE_REVERTED: 'Возврат списания (изменение посещения)',
  MAKEUP_GRANTED: 'Отработка (начисление урока)',
  MANUAL_SET: 'Ручная правка',
}

const statusLabel: Record<AttendanceStatus, string> = {
  PRESENT: 'Присутствовал',
  ABSENT: 'Отсутствовал',
  UNSPECIFIED: 'Не указано',
}

type PaymentMeta = {
  lessonCount: number
  price: number
  leadName?: string
  productName?: string
  paymentId?: number
}

type AttendanceMeta = {
  lessonId: number
  lessonName?: string
  newStatus: AttendanceStatus
  oldStatus: AttendanceStatus
  newIsWarned: boolean | null
  oldIsWarned: boolean | null
  attendanceId: number
  isMakeupAttendance: boolean
}

type MakeupGrantedMeta = {
  makeUpLessonId: number
  makeUpLessonName?: string
  makeUpAttendanceId: number
  missedAttendanceId: number
}

function getMetaDetails(
  reason: StudentLessonsBalanceChangeReason,
  meta: JsonValue | null
): React.ReactNode {
  if (!meta || typeof meta !== 'object' || Array.isArray(meta)) return null

  const m = meta as Record<string, unknown>

  switch (reason) {
    case 'PAYMENT_CREATED':
    case 'PAYMENT_CANCELLED': {
      const paymentMeta = m as PaymentMeta
      const parts: string[] = []
      if (paymentMeta.lessonCount) parts.push(`${paymentMeta.lessonCount} ур.`)
      if (paymentMeta.price) parts.push(`${paymentMeta.price} ₽`)
      if (paymentMeta.productName) parts.push(paymentMeta.productName)
      return parts.length > 0 ? (
        <span className="text-muted-foreground text-sm">{parts.join(' · ')}</span>
      ) : null
    }

    case 'ATTENDANCE_PRESENT_CHARGED':
    case 'ATTENDANCE_ABSENT_CHARGED':
    case 'ATTENDANCE_REVERTED':
    case 'MAKEUP_ATTENDED_CHARGED': {
      const attendanceMeta = m as AttendanceMeta

      return (
        <Link
          href={`/dashboard/lessons/${attendanceMeta.lessonId}`}
          className="text-primary hover:underline"
        >
          {attendanceMeta.lessonName ?? `Урок #${attendanceMeta.lessonId}`}
        </Link>
      )
    }

    case 'MAKEUP_GRANTED': {
      const makeupMeta = m as MakeupGrantedMeta
      return (
        <Link
          href={`/dashboard/lessons/${makeupMeta.makeUpLessonId}`}
          className="text-primary hover:underline"
        >
          {makeupMeta.makeUpLessonName ?? `Урок #${makeupMeta.makeUpLessonId}`}
        </Link>
      )
    }

    case 'MANUAL_SET':
    default:
      return null
  }
}

export default function LessonsBalanceHistory({ history }: { history: HistoryRow[] }) {
  if (!history.length) {
    return (
      <div>
        <h3 className="text-muted-foreground text-lg font-semibold">История баланса уроков</h3>
        <p className="text-muted-foreground mt-2">Пока нет изменений.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-muted-foreground text-lg font-semibold">История баланса уроков</h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Дата</TableHead>
              <TableHead>Причина</TableHead>
              <TableHead>Детали</TableHead>
              <TableHead>Кем</TableHead>
              <TableHead className="text-right">Комментарий</TableHead>
              <TableHead className="text-right">Δ</TableHead>
              <TableHead className="text-right">Было</TableHead>
              <TableHead className="text-right">Стало</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((row) => {
              const actor = row.actorUser ? row.actorUser.name : 'Система'

              const deltaText = row.delta > 0 ? `+${row.delta}` : String(row.delta)
              const metaDetails = getMetaDetails(row.reason, row.meta)

              return (
                <TableRow key={row.id}>
                  <TableCell>
                    {toZonedTime(new Date(row.createdAt), 'Europe/Moscow').toLocaleString('ru-RU')}
                  </TableCell>
                  <TableCell>{reasonLabel[row.reason] ?? row.reason}</TableCell>
                  <TableCell>{metaDetails}</TableCell>
                  <TableCell>
                    {row.actorUser ? (
                      <Link
                        href={`/dashboard/users/${row.actorUser?.id}`}
                        className="text-primary hover:underline"
                      >
                        {actor}
                      </Link>
                    ) : (
                      actor
                    )}
                  </TableCell>
                  <TableCell className="truncate text-right">{row.comment ?? '-'}</TableCell>
                  <TableCell className="text-right">{deltaText}</TableCell>
                  <TableCell className="text-right">{row.balanceBefore}</TableCell>
                  <TableCell className="text-right">{row.balanceAfter}</TableCell>
                  <TableCell>
                    <LessonsBalanceHistoryActions historyId={row.id} comment={row.comment} />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function LessonsBalanceHistoryActions({
  historyId,
  comment,
}: {
  historyId: number
  comment: string | null
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newComment, setNewComment] = useState<string | null>(comment)
  const [isPending, startTransition] = useTransition()

  const handleCommentAdd = () => {
    if (!newComment) return
    startTransition(() => {
      const ok = updateStudentBalanceHistory({
        where: {
          id: historyId,
        },
        data: {
          comment: newComment,
        },
      })
      toast.promise(ok, {
        loading: 'Добавление комментария',
        success: 'Комментарий успешно добавлен',
        error: 'Ошибка при добавлении комментария',
        finally: () => {
          setDialogOpen(false)
        },
      })
    })
  }

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger render={<Button size={'icon'} variant={'ghost'} />}>
          <MoreVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent className={'w-max'}>
          <DropdownMenuItem
            onClick={() => {
              setDropdownOpen(false)
              setDialogOpen(true)
            }}
          >
            Оставить комментарий
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Комментарий</DialogTitle>
            <DialogDescription>Оставить комментарий к записи в истории</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel></FieldLabel>
              <Input
                value={newComment ?? ''}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="комментарий"
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose render={<Button variant={'outline'}>Отмена</Button>} />
            <Button onClick={handleCommentAdd} disabled={isPending}>
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
