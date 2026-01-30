import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getFullName } from '@/lib/utils'
import { StudentLessonsBalanceChangeReason } from '@prisma/client'

type HistoryRow = {
  id: number
  createdAt: Date
  reason: StudentLessonsBalanceChangeReason
  delta: number
  balanceBefore: number
  balanceAfter: number
  comment: string | null
  actorUser: { firstName: string; lastName: string | null } | null
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
              <TableHead>Кем</TableHead>
              <TableHead className="text-right">Δ</TableHead>
              <TableHead className="text-right">Было</TableHead>
              <TableHead className="text-right">Стало</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((row) => {
              const actor = row.actorUser
                ? getFullName(row.actorUser.firstName, row.actorUser.lastName)
                : 'Система'

              const deltaText = row.delta > 0 ? `+${row.delta}` : String(row.delta)

              return (
                <TableRow key={row.id}>
                  <TableCell>{new Date(row.createdAt).toLocaleString('ru-RU')}</TableCell>
                  <TableCell>{reasonLabel[row.reason] ?? row.reason}</TableCell>
                  <TableCell>{actor}</TableCell>
                  <TableCell className="text-right font-medium">{deltaText}</TableCell>
                  <TableCell className="text-right">{row.balanceBefore}</TableCell>
                  <TableCell className="text-right">{row.balanceAfter}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
