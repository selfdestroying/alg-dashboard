'use client'

import { StudentFinancialField, StudentLessonsBalanceChangeReason } from '@/prisma/generated/enums'
import type { StudentWithGroupsAndAttendance } from '@/src/app/[slug]/students/[id]/_components/types'
import { Hint } from '@/src/components/hint'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/src/components/ui/alert-dialog'
import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/src/components/ui/collapsible'
import { Field, FieldGroup, FieldLabel } from '@/src/components/ui/field'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Progress } from '@/src/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/src/components/ui/sheet'
import { redistributeBalance } from '@/src/features/students/actions'
import {
  createWallet,
  deleteWallet,
  linkGroupToWallet,
  mergeWallets,
  transferWalletBalance,
  updateWalletBalance,
} from '@/src/features/wallets/actions'
import { getBadgeVariant, getBalanceVariant, getWalletLabel } from '@/src/features/wallets/utils'
import { cn, getGroupName } from '@/src/lib/utils'
import {
  ArrowLeftRight,
  ChevronDown,
  Link2,
  Loader,
  Merge,
  Pen,
  Plus,
  Trash2,
  TrendingDown,
  TriangleAlert,
  Wallet,
} from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

type SheetType = 'create' | 'merge' | 'transfer' | 'link' | 'edit' | 'reassign' | null

interface WalletsSectionProps {
  student: StudentWithGroupsAndAttendance
}

export default function WalletsSection({ student }: WalletsSectionProps) {
  const [isPending, startTransition] = useTransition()
  const [activeSheet, setActiveSheet] = useState<SheetType>(null)

  // Create wallet state
  const [newWalletName, setNewWalletName] = useState('')

  // Merge state
  const [mergeSource, setMergeSource] = useState<string>('')
  const [mergeTarget, setMergeTarget] = useState<string>('')

  // Transfer state
  const [transferSource, setTransferSource] = useState<string>('')
  const [transferTarget, setTransferTarget] = useState<string>('')
  const [transferLessons, setTransferLessons] = useState(0)
  const [transferTotalLessons, setTransferTotalLessons] = useState(0)
  const [transferTotalPayments, setTransferTotalPayments] = useState(0)

  // Link state
  const [linkWalletId, setLinkWalletId] = useState<string>('')
  const [linkGroupId, setLinkGroupId] = useState<string>('')

  // Edit wallet state
  const [editWalletId, setEditWalletId] = useState<number | null>(null)
  const [editLessonsBalance, setEditLessonsBalance] = useState(0)
  const [editTotalPayments, setEditTotalPayments] = useState(0)
  const [editTotalLessons, setEditTotalLessons] = useState(0)

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteWalletId, setDeleteWalletId] = useState<number | null>(null)

  // Reassign state
  const [reassignGroupId, setReassignGroupId] = useState<number | null>(null)
  const [reassignFromWalletId, setReassignFromWalletId] = useState<number | null>(null)
  const [reassignToWalletId, setReassignToWalletId] = useState<string>('')

  const unlinkedGroups = student.groups.filter(
    (sg) =>
      (sg.status === 'ACTIVE' || sg.status === 'TRIAL') &&
      !student.wallets.some((w) => w.studentGroups.some((wsg) => wsg.groupId === sg.groupId)),
  )

  const walletLabelById = (id: string) =>
    getWalletLabel(student.wallets.find((w) => w.id.toString() === id)!)

  const openEditSheet = (w: StudentWithGroupsAndAttendance['wallets'][number]) => {
    setEditWalletId(w.id)
    setEditLessonsBalance(w.lessonsBalance)
    setEditTotalPayments(w.totalPayments)
    setEditTotalLessons(w.totalLessons)
    setActiveSheet('edit')
  }

  const handleCreate = () => {
    startTransition(async () => {
      try {
        await createWallet({
          studentId: student.id,
          name: newWalletName || undefined,
        })
        toast.success('Кошелёк создан')
        setActiveSheet(null)
        setNewWalletName('')
      } catch {
        toast.error('Не удалось создать кошелёк')
      }
    })
  }

  const handleMerge = () => {
    if (!mergeSource || !mergeTarget || mergeSource === mergeTarget) return
    startTransition(async () => {
      try {
        await mergeWallets({
          sourceWalletId: Number(mergeSource),
          targetWalletId: Number(mergeTarget),
        })
        toast.success('Кошельки объединены')
        setActiveSheet(null)
        setMergeSource('')
        setMergeTarget('')
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Не удалось объединить кошельки')
      }
    })
  }

  const handleTransfer = () => {
    if (!transferSource || !transferTarget || transferSource === transferTarget) return
    startTransition(async () => {
      try {
        await transferWalletBalance({
          sourceWalletId: Number(transferSource),
          targetWalletId: Number(transferTarget),
          lessonsBalance: transferLessons,
          totalLessons: transferTotalLessons,
          totalPayments: transferTotalPayments,
        })
        toast.success('Баланс переведён')
        setActiveSheet(null)
        setTransferSource('')
        setTransferTarget('')
        setTransferLessons(0)
        setTransferTotalLessons(0)
        setTransferTotalPayments(0)
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Не удалось перевести баланс')
      }
    })
  }

  const handleLink = () => {
    if (!linkWalletId || !linkGroupId) return
    startTransition(async () => {
      try {
        await linkGroupToWallet({
          studentId: student.id,
          groupId: Number(linkGroupId),
          walletId: Number(linkWalletId),
        })
        toast.success('Группа привязана к кошельку')
        setActiveSheet(null)
        setLinkWalletId('')
        setLinkGroupId('')
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Не удалось привязать группу')
      }
    })
  }

  const handleEditBalance = () => {
    if (editWalletId === null) return
    const original = student.wallets.find((w) => w.id === editWalletId)
    if (!original) return

    const changes: Record<string, number> = {}
    if (editLessonsBalance !== original.lessonsBalance) changes.lessonsBalance = editLessonsBalance
    if (editTotalPayments !== original.totalPayments) changes.totalPayments = editTotalPayments
    if (editTotalLessons !== original.totalLessons) changes.totalLessons = editTotalLessons

    if (Object.keys(changes).length === 0) {
      setActiveSheet(null)
      return
    }

    const audit: Partial<
      Record<
        StudentFinancialField,
        { reason: StudentLessonsBalanceChangeReason; meta: Record<string, string | number> }
      >
    > = {}
    if ('lessonsBalance' in changes) {
      audit[StudentFinancialField.LESSONS_BALANCE] = {
        reason: StudentLessonsBalanceChangeReason.MANUAL_SET,
        meta: { source: 'wallet-card', walletId: editWalletId },
      }
    }
    if ('totalPayments' in changes) {
      audit[StudentFinancialField.TOTAL_PAYMENTS] = {
        reason: StudentLessonsBalanceChangeReason.MANUAL_SET,
        meta: { source: 'wallet-card', walletId: editWalletId },
      }
    }
    if ('totalLessons' in changes) {
      audit[StudentFinancialField.TOTAL_LESSONS] = {
        reason: StudentLessonsBalanceChangeReason.MANUAL_SET,
        meta: { source: 'wallet-card', walletId: editWalletId },
      }
    }

    startTransition(async () => {
      try {
        await updateWalletBalance({
          walletId: editWalletId,
          data: changes,
          audit,
        })
        toast.success('Баланс обновлён')
        setActiveSheet(null)
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Не удалось обновить баланс')
      }
    })
  }

  const confirmDelete = (walletId: number) => {
    setDeleteWalletId(walletId)
    setDeleteDialogOpen(true)
  }

  const openReassignSheet = (groupId: number, currentWalletId: number) => {
    setReassignGroupId(groupId)
    setReassignFromWalletId(currentWalletId)
    setReassignToWalletId('')
    setActiveSheet('reassign')
  }

  const handleReassign = () => {
    if (reassignGroupId === null || !reassignToWalletId) return
    startTransition(async () => {
      try {
        await linkGroupToWallet({
          studentId: student.id,
          groupId: reassignGroupId,
          walletId: Number(reassignToWalletId),
        })
        toast.success('Группа перепривязана к другому кошельку')
        setActiveSheet(null)
        setReassignGroupId(null)
        setReassignFromWalletId(null)
        setReassignToWalletId('')
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Не удалось перепривязать группу')
      }
    })
  }

  const handleDelete = () => {
    if (deleteWalletId === null) return
    startTransition(async () => {
      try {
        await deleteWallet({ walletId: deleteWalletId })
        toast.success('Кошелёк удалён')
        setDeleteDialogOpen(false)
        setDeleteWalletId(null)
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Не удалось удалить кошелёк')
      }
    })
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-muted-foreground flex items-center gap-2 text-lg font-semibold">
          <Wallet size={20} />
          Кошельки
          <Hint text="Кошельки хранят баланс уроков и привязаны к группам. Один кошелёк может обслуживать несколько групп. Оплаты зачисляются на конкретный кошелёк." />
        </h3>
        <div className="flex gap-1">
          <Button size="sm" variant="outline" onClick={() => setActiveSheet('create')}>
            <Plus className="size-4" />
            Создать
          </Button>
          {student.wallets.length >= 2 && (
            <>
              <Button size="sm" variant="outline" onClick={() => setActiveSheet('merge')}>
                <Merge className="size-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => setActiveSheet('transfer')}>
                <ArrowLeftRight className="size-4" />
              </Button>
            </>
          )}
          {unlinkedGroups.length > 0 && student.wallets.length > 0 && (
            <Button size="sm" variant="outline" onClick={() => setActiveSheet('link')}>
              <Link2 className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Unallocated balance warning */}
      {student.lessonsBalance > 0 && (
        <div className="bg-muted/50 flex items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-xs">
          <TrendingDown className="text-muted-foreground size-3.5 shrink-0" />
          <span className="text-muted-foreground">
            Нераспределённый остаток:{' '}
            <span className="text-foreground font-medium">{student.lessonsBalance} ур.</span>
            {' — '}не привязан ни к одному кошельку
          </span>
          <Hint text="Этот баланс остался от старой системы учёта и не привязан ни к одному кошельку. Используйте «Распределение баланса» чтобы перенести его." variant="warning" />
        </div>
      )}

      {/* Inline redistribute (collapsible) */}
      <RedistributeInline student={student} />

      {/* Wallet cards */}
      {student.wallets.length === 0 ? (
        <div className="bg-muted/50 rounded-lg border border-dashed p-4 text-center text-sm">
          <p className="text-muted-foreground">Нет кошельков</p>
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {student.wallets.map((w) => {
            const variant = getBalanceVariant(w.lessonsBalance)
            const progressValue =
              w.totalLessons > 0
                ? (w.lessonsBalance / w.totalLessons) * 100
                : w.lessonsBalance > 0
                  ? 100
                  : 0

            return (
              <div key={w.id} className="bg-muted/50 space-y-2.5 rounded-lg p-3">
                {/* Header: name + badge + actions */}
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs leading-tight font-medium">{getWalletLabel(w)}</span>
                  <div className="flex items-center gap-1">
                    <Badge variant={getBadgeVariant(variant)}>{w.lessonsBalance} ур.</Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-6"
                      onClick={() => openEditSheet(w)}
                      disabled={isPending}
                    >
                      <Pen className="size-3" />
                    </Button>
                    {w.studentGroups.length === 0 && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-6"
                        onClick={() => confirmDelete(w.id)}
                        disabled={isPending}
                      >
                        <Trash2 className="text-destructive size-3" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <Progress value={progressValue} variant={variant} />

                {/* Metrics row */}
                <div className="flex items-center justify-between text-[0.6875rem]">
                  <span className="text-muted-foreground">
                    Оплаты:{' '}
                    <span className="text-foreground font-medium">
                      {w.totalPayments.toLocaleString('ru-RU')} ₽
                    </span>
                  </span>
                  <span className="text-muted-foreground">
                    Уроки: <span className="text-foreground font-medium">{w.totalLessons}</span>
                  </span>
                </div>

                {/* Linked groups */}
                {w.studentGroups.length > 0 && (
                  <div className="text-muted-foreground space-y-0.5 text-[0.625rem]">
                    <span>Группы:</span>
                    {w.studentGroups.map((sg) => {
                      const isInactive = sg.status === 'DISMISSED' || sg.status === 'TRANSFERRED'
                      return (
                        <div
                          key={sg.groupId}
                          className={cn(
                            'flex items-center justify-between gap-1',
                            isInactive && 'opacity-50',
                          )}
                        >
                          <div className="flex items-center gap-1 truncate">
                            <span className="truncate">{getGroupName(sg.group)}</span>
                            {sg.status === 'DISMISSED' && (
                              <Badge variant="destructive" className="px-1 py-0 text-[0.5rem]">
                                Отчислен
                              </Badge>
                            )}
                            {sg.status === 'TRANSFERRED' && (
                              <Badge variant="outline" className="px-1 py-0 text-[0.5rem]">
                                Переведён
                              </Badge>
                            )}
                          </div>
                          {!isInactive && student.wallets.length >= 2 && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-5 shrink-0"
                              onClick={() => openReassignSheet(sg.groupId, w.id)}
                              disabled={isPending}
                              title="Перепривязать к другому кошельку"
                            >
                              <ArrowLeftRight className="size-2.5" />
                            </Button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <TriangleAlert />
            </AlertDialogMedia>
            <AlertDialogTitle>Удалить кошелёк?</AlertDialogTitle>
            <AlertDialogDescription>
              Кошелёк будет удалён без возможности восстановления.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending && <Loader className="animate-spin" />}
              Удалить
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Single dynamic Sheet */}
      <Sheet open={activeSheet !== null} onOpenChange={(o) => !o && setActiveSheet(null)}>
        <SheetContent side="right">
          {activeSheet === 'create' && (
            <>
              <SheetHeader>
                <SheetTitle>Создать кошелёк</SheetTitle>
                <SheetDescription>Создайте новый кошелёк для ученика.</SheetDescription>
              </SheetHeader>
              <div className="px-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="wallet-name">Название (опционально)</FieldLabel>
                    <Input
                      id="wallet-name"
                      value={newWalletName}
                      onChange={(e) => setNewWalletName(e.target.value)}
                      placeholder="Например: Основной"
                    />
                  </Field>
                </FieldGroup>
              </div>
              <SheetFooter>
                <SheetClose render={<Button variant="outline" />}>Отмена</SheetClose>
                <Button onClick={handleCreate} disabled={isPending}>
                  {isPending && <Loader className="animate-spin" />}
                  Создать
                </Button>
              </SheetFooter>
            </>
          )}

          {activeSheet === 'merge' && (
            <>
              <SheetHeader>
                <SheetTitle>Объединить кошельки</SheetTitle>
                <SheetDescription>
                  Балансы будут суммированы, группы перенесены в целевой кошелёк, исходный удалён.
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 px-4">
                <Field>
                  <FieldLabel>Исходный кошелёк (будет удалён)</FieldLabel>
                  <Select
                    value={mergeSource}
                    onValueChange={(value) => setMergeSource(value as string)}
                    itemToStringLabel={(v) => {
                      const w = student.wallets.find((w) => w.id.toString() === v)
                      return w ? getWalletLabel(w) : ''
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Выберите" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {student.wallets.map((w) => (
                          <SelectItem key={w.id} value={w.id.toString()}>
                            {getWalletLabel(w)}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>Целевой кошелёк</FieldLabel>
                  <Select
                    value={mergeTarget}
                    onValueChange={(value) => setMergeTarget(value as string)}
                    itemToStringLabel={(v) => {
                      const w = student.wallets.find((w) => w.id.toString() === v)
                      return w ? getWalletLabel(w) : ''
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Выберите" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {student.wallets
                          .filter((w) => w.id.toString() !== mergeSource)
                          .map((w) => (
                            <SelectItem key={w.id} value={w.id.toString()}>
                              {getWalletLabel(w)}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <SheetFooter>
                <SheetClose render={<Button variant="outline" />}>Отмена</SheetClose>
                <Button
                  onClick={handleMerge}
                  disabled={
                    isPending || !mergeSource || !mergeTarget || mergeSource === mergeTarget
                  }
                >
                  {isPending && <Loader className="animate-spin" />}
                  Объединить
                </Button>
              </SheetFooter>
            </>
          )}

          {activeSheet === 'transfer' && (
            <>
              <SheetHeader>
                <SheetTitle>Перевести баланс</SheetTitle>
                <SheetDescription>
                  Переведите часть баланса из одного кошелька в другой.
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 px-4">
                <Field>
                  <FieldLabel>Из кошелька</FieldLabel>
                  <Select
                    value={transferSource}
                    onValueChange={(value) => setTransferSource(value as string)}
                    itemToStringLabel={(v) => {
                      const w = student.wallets.find((w) => w.id.toString() === v)
                      return w
                        ? `${getWalletLabel(w)} — ${w.lessonsBalance} ур., ${w.totalPayments} ₽`
                        : ''
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Выберите" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {student.wallets.map((w) => (
                          <SelectItem key={w.id} value={w.id.toString()}>
                            {getWalletLabel(w)} — {w.lessonsBalance} ур., {w.totalPayments} ₽
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>В кошелёк</FieldLabel>
                  <Select
                    value={transferTarget}
                    onValueChange={(value) => setTransferTarget(value as string)}
                    itemToStringLabel={(v) => {
                      const w = student.wallets.find((w) => w.id.toString() === v)
                      return w ? getWalletLabel(w) : ''
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Выберите" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {student.wallets
                          .filter((w) => w.id.toString() !== transferSource)
                          .map((w) => (
                            <SelectItem key={w.id} value={w.id.toString()}>
                              {getWalletLabel(w)}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <FieldGroup>
                  <Field>
                    <FieldLabel>Баланс уроков</FieldLabel>
                    <Input
                      type="number"
                      min={0}
                      value={transferLessons}
                      onChange={(e) => setTransferLessons(Number(e.target.value))}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Всего уроков</FieldLabel>
                    <Input
                      type="number"
                      min={0}
                      value={transferTotalLessons}
                      onChange={(e) => setTransferTotalLessons(Number(e.target.value))}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Сумма оплат</FieldLabel>
                    <Input
                      type="number"
                      min={0}
                      value={transferTotalPayments}
                      onChange={(e) => setTransferTotalPayments(Number(e.target.value))}
                    />
                  </Field>
                </FieldGroup>
              </div>
              <SheetFooter>
                <SheetClose render={<Button variant="outline" />}>Отмена</SheetClose>
                <Button
                  onClick={handleTransfer}
                  disabled={
                    isPending ||
                    !transferSource ||
                    !transferTarget ||
                    transferSource === transferTarget ||
                    (transferLessons === 0 &&
                      transferTotalLessons === 0 &&
                      transferTotalPayments === 0)
                  }
                >
                  {isPending && <Loader className="animate-spin" />}
                  Перевести
                </Button>
              </SheetFooter>
            </>
          )}

          {activeSheet === 'link' && (
            <>
              <SheetHeader>
                <SheetTitle>Привязать группу к кошельку</SheetTitle>
                <SheetDescription>
                  Выберите группу без кошелька и привяжите её к существующему кошельку.
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 px-4">
                <Field>
                  <FieldLabel>Группа</FieldLabel>
                  <Select
                    value={linkGroupId}
                    onValueChange={(value) => setLinkGroupId(value as string)}
                    itemToStringLabel={(v) => {
                      const sg = unlinkedGroups.find((sg) => sg.groupId.toString() === v)
                      return sg ? getGroupName(sg.group) : ''
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Выберите группу" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {unlinkedGroups.map((sg) => (
                          <SelectItem key={sg.groupId} value={sg.groupId.toString()}>
                            {getGroupName(sg.group)}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>Кошелёк</FieldLabel>
                  <Select
                    value={linkWalletId}
                    onValueChange={(value) => setLinkWalletId(value as string)}
                    itemToStringLabel={(v) => {
                      const w = student.wallets.find((w) => w.id.toString() === v)
                      return w ? getWalletLabel(w) : ''
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Выберите кошелёк" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {student.wallets.map((w) => (
                          <SelectItem key={w.id} value={w.id.toString()}>
                            {getWalletLabel(w)}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <SheetFooter>
                <SheetClose render={<Button variant="outline" />}>Отмена</SheetClose>
                <Button onClick={handleLink} disabled={isPending || !linkWalletId || !linkGroupId}>
                  {isPending && <Loader className="animate-spin" />}
                  Привязать
                </Button>
              </SheetFooter>
            </>
          )}

          {activeSheet === 'edit' && editWalletId !== null && (
            <>
              <SheetHeader>
                <SheetTitle>Редактировать баланс</SheetTitle>
                <SheetDescription>{walletLabelById(editWalletId.toString())}</SheetDescription>
              </SheetHeader>
              <div className="space-y-4 px-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="edit-lb">Баланс уроков</FieldLabel>
                    <Input
                      id="edit-lb"
                      type="number"
                      value={editLessonsBalance}
                      onChange={(e) => setEditLessonsBalance(Number(e.target.value))}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="edit-tp">Сумма оплат</FieldLabel>
                    <Input
                      id="edit-tp"
                      type="number"
                      value={editTotalPayments}
                      onChange={(e) => setEditTotalPayments(Number(e.target.value))}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="edit-tl">Всего уроков</FieldLabel>
                    <Input
                      id="edit-tl"
                      type="number"
                      value={editTotalLessons}
                      onChange={(e) => setEditTotalLessons(Number(e.target.value))}
                    />
                  </Field>
                </FieldGroup>
              </div>
              <SheetFooter>
                <SheetClose render={<Button variant="outline" />}>Отмена</SheetClose>
                <Button onClick={handleEditBalance} disabled={isPending}>
                  {isPending && <Loader className="animate-spin" />}
                  Сохранить
                </Button>
              </SheetFooter>
            </>
          )}

          {activeSheet === 'reassign' &&
            reassignGroupId !== null &&
            reassignFromWalletId !== null && (
              <>
                <SheetHeader>
                  <SheetTitle>Перепривязать группу</SheetTitle>
                  <SheetDescription>
                    Выберите кошелёк, к которому будет привязана группа.
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-4 px-4">
                  <Field>
                    <FieldLabel>Группа</FieldLabel>
                    <Input
                      disabled
                      value={(() => {
                        const w = student.wallets.find((w) => w.id === reassignFromWalletId)
                        const sg = w?.studentGroups.find((sg) => sg.groupId === reassignGroupId)
                        return sg ? getGroupName(sg.group) : ''
                      })()}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Текущий кошелёк</FieldLabel>
                    <Input disabled value={walletLabelById(reassignFromWalletId.toString())} />
                  </Field>
                  <Field>
                    <FieldLabel>Новый кошелёк</FieldLabel>
                    <Select
                      value={reassignToWalletId}
                      onValueChange={(value) => setReassignToWalletId(value as string)}
                      itemToStringLabel={(v) => {
                        const w = student.wallets.find((w) => w.id.toString() === v)
                        return w ? getWalletLabel(w) : ''
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Выберите кошелёк" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {student.wallets
                            .filter((w) => w.id !== reassignFromWalletId)
                            .map((w) => (
                              <SelectItem key={w.id} value={w.id.toString()}>
                                {getWalletLabel(w)}
                              </SelectItem>
                            ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <SheetFooter>
                  <SheetClose render={<Button variant="outline" />}>Отмена</SheetClose>
                  <Button onClick={handleReassign} disabled={isPending || !reassignToWalletId}>
                    {isPending && <Loader className="animate-spin" />}
                    Перепривязать
                  </Button>
                </SheetFooter>
              </>
            )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

// ─── Inline Redistribute ────────────────────────────────────────────

type WalletAllocation = {
  lessons: number
  totalLessons: number
  totalPayments: number
}

function RedistributeInline({ student }: { student: StudentWithGroupsAndAttendance }) {
  const [isPending, startTransition] = useTransition()

  const unallocatedLessons = student.lessonsBalance
  const unallocatedTotalLessons = student.totalLessons
  const unallocatedTotalPayments = student.totalPayments

  const hasAnythingToRedistribute =
    unallocatedLessons > 0 || unallocatedTotalLessons > 0 || unallocatedTotalPayments > 0

  const [allocations, setAllocations] = useState<Record<number, WalletAllocation>>(() => {
    const initial: Record<number, WalletAllocation> = {}
    for (const w of student.wallets) {
      initial[w.id] = { lessons: 0, totalLessons: 0, totalPayments: 0 }
    }
    return initial
  })

  const sumLessons = Object.values(allocations).reduce((s, a) => s + a.lessons, 0)
  const sumTotalLessons = Object.values(allocations).reduce((s, a) => s + a.totalLessons, 0)
  const sumTotalPayments = Object.values(allocations).reduce((s, a) => s + a.totalPayments, 0)

  const remainingLessons = unallocatedLessons - sumLessons
  const remainingTotalLessons = unallocatedTotalLessons - sumTotalLessons
  const remainingTotalPayments = unallocatedTotalPayments - sumTotalPayments

  const hasOverflow =
    remainingLessons < 0 || remainingTotalLessons < 0 || remainingTotalPayments < 0
  const hasChanges = sumLessons > 0 || sumTotalLessons > 0 || sumTotalPayments > 0

  const updateField = (walletId: number, field: keyof WalletAllocation, value: number) => {
    setAllocations((prev) => ({
      ...prev,
      [walletId]: {
        ...(prev[walletId] ?? { lessons: 0, totalLessons: 0, totalPayments: 0 }),
        [field]: Math.max(0, value),
      },
    }))
  }

  const handleSubmit = () => {
    if (hasOverflow) {
      toast.error('Сумма распределений превышает нераспределённый баланс')
      return
    }

    const entries = Object.entries(allocations)
      .filter(([, a]) => a.lessons > 0 || a.totalLessons > 0 || a.totalPayments > 0)
      .map(([walletId, a]) => ({
        walletId: Number(walletId),
        lessons: a.lessons || undefined,
        totalLessons: a.totalLessons || undefined,
        totalPayments: a.totalPayments || undefined,
      }))

    if (entries.length === 0) {
      toast.error('Укажите хотя бы один кошелёк для распределения')
      return
    }

    startTransition(async () => {
      try {
        await redistributeBalance({
          studentId: student.id,
          allocations: entries,
        })
        toast.success('Баланс успешно перераспределён!')
        setAllocations((prev) => {
          const reset: Record<number, WalletAllocation> = {}
          for (const k of Object.keys(prev)) {
            reset[Number(k)] = { lessons: 0, totalLessons: 0, totalPayments: 0 }
          }
          return reset
        })
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Ошибка при перераспределении баланса')
      }
    })
  }

  if (!hasAnythingToRedistribute || student.wallets.length === 0) {
    return null
  }

  return (
    <Collapsible>
      <CollapsibleTrigger className="text-muted-foreground hover:text-foreground flex w-full items-center gap-1.5 text-xs transition-colors">
        <TrendingDown className="size-3.5" />
        <span>Распределить нераспределённый баланс</span>
        <ChevronDown className="size-3.5 transition-transform in-data-panel-open:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-3 space-y-3">
          {/* Unallocated summary */}
          <div className="space-y-1 text-xs">
            {unallocatedLessons > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Нераспр. баланс уроков</span>
                <span className="font-medium">{unallocatedLessons} ур.</span>
              </div>
            )}
            {unallocatedTotalLessons > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Нераспр. всего уроков</span>
                <span className="font-medium">{unallocatedTotalLessons}</span>
              </div>
            )}
            {unallocatedTotalPayments > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Нераспр. сумма оплат</span>
                <span className="font-medium">{unallocatedTotalPayments} ₽</span>
              </div>
            )}
          </div>

          {/* Per-wallet inputs */}
          <div className="space-y-3">
            {student.wallets.map((w) => {
              const alloc = allocations[w.id]
              return (
                <div key={w.id} className="space-y-1.5">
                  <Label className="text-xs font-medium">{getWalletLabel(w)}</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {unallocatedLessons > 0 && (
                      <Field>
                        <FieldLabel className="text-[0.625rem]">Баланс ур.</FieldLabel>
                        <Input
                          type="number"
                          min={0}
                          value={alloc?.lessons ?? 0}
                          onChange={(e) => updateField(w.id, 'lessons', Number(e.target.value))}
                          disabled={isPending}
                        />
                        <span className="text-muted-foreground text-[0.625rem]">
                          сейчас: {w.lessonsBalance}
                        </span>
                      </Field>
                    )}
                    {unallocatedTotalLessons > 0 && (
                      <Field>
                        <FieldLabel className="text-[0.625rem]">Всего ур.</FieldLabel>
                        <Input
                          type="number"
                          min={0}
                          value={alloc?.totalLessons ?? 0}
                          onChange={(e) =>
                            updateField(w.id, 'totalLessons', Number(e.target.value))
                          }
                          disabled={isPending}
                        />
                        <span className="text-muted-foreground text-[0.625rem]">
                          сейчас: {w.totalLessons}
                        </span>
                      </Field>
                    )}
                    {unallocatedTotalPayments > 0 && (
                      <Field>
                        <FieldLabel className="text-[0.625rem]">Оплаты ₽</FieldLabel>
                        <Input
                          type="number"
                          min={0}
                          value={alloc?.totalPayments ?? 0}
                          onChange={(e) =>
                            updateField(w.id, 'totalPayments', Number(e.target.value))
                          }
                          disabled={isPending}
                        />
                        <span className="text-muted-foreground text-[0.625rem]">
                          сейчас: {w.totalPayments}
                        </span>
                      </Field>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Remaining summary */}
          <div className="space-y-1 text-xs">
            {unallocatedLessons > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Останется баланс ур.:</span>
                <span
                  className={remainingLessons < 0 ? 'text-destructive font-medium' : 'font-medium'}
                >
                  {remainingLessons}
                </span>
              </div>
            )}
            {unallocatedTotalLessons > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Останется всего ур.:</span>
                <span
                  className={
                    remainingTotalLessons < 0 ? 'text-destructive font-medium' : 'font-medium'
                  }
                >
                  {remainingTotalLessons}
                </span>
              </div>
            )}
            {unallocatedTotalPayments > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Останется оплат ₽:</span>
                <span
                  className={
                    remainingTotalPayments < 0 ? 'text-destructive font-medium' : 'font-medium'
                  }
                >
                  {remainingTotalPayments}
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={isPending || hasOverflow || !hasChanges}
            >
              {isPending && <Loader className="mr-2 animate-spin" />}
              Распределить
            </Button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
