'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

import { deleteGroup, GroupWithTeacherAndCourse } from '@/actions/groups'
import { UserData } from '@/actions/users'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useData } from '@/providers/data-provider'
import { GroupType } from '@prisma/client'
import { ColumnDef } from '@tanstack/react-table'
import { Trash } from 'lucide-react'
import Link from 'next/link'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import DataTable from '../data-table'

const getColumns = (users: string[]): ColumnDef<GroupWithTeacherAndCourse>[] => [
  {
    header: 'Название',
    accessorKey: 'name',
    cell: ({ row }) => (
      <Button asChild variant={'link'} size={'sm'} className="h-fit p-0 font-medium">
        <Link href={`/dashboard/groups/${row.original.id}`}>{row.getValue('name')}</Link>
      </Button>
    ),
    meta: {
      filterVariant: 'text',
    },
  },
  {
    header: 'Курс',
    accessorFn: (item) => item.course.name,
    meta: {
      filterVariant: 'select',
    },
  },
  {
    header: 'Учителя',
    accessorKey: 'teacher',
    accessorFn: (item) =>
      item.teachers
        .map((teacher) => `${teacher.teacher.firstName} ${teacher.teacher.lastName ?? ''}`)
        .join(', '),
    // filterFn: (row, columnId, filterValue: string) => {
    //   return true
    // },
    meta: {
      filterVariant: 'select',
      allFilterVariants: users,
    },
  },
  {
    header: 'Тип',
    accessorFn: (item) => (item.type ? GroupTypeMap[item.type] : 'Без типа'),
    meta: {
      filterVariant: 'select',
    },
  },
  {
    header: 'Время',
    accessorFn: (item) => item.time ?? 'Без времени',
    meta: {
      filterVariant: 'select',
    },
  },
  {
    header: 'БО',
    accessorKey: 'backOfficeUrl',
    cell: ({ row }) => (
      <Button asChild variant={'link'} className="h-fit w-fit p-0 font-medium">
        <a target="_blank" href={row.getValue('backOfficeUrl')}>
          {row.getValue('backOfficeUrl') || 'Нет ссылки'}
        </a>
      </Button>
    ),
    meta: {
      filterVariant: 'text',
    },
  },
  {
    id: 'actions',
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <RowActions item={row.original} />,
    enableHiding: false,
  },
]

const GroupTypeMap: { [key in GroupType]: string } = {
  GROUP: 'Группа',
  INDIVIDUAL: 'Индивидуальное занятие',
  INTENSIVE: 'Интенсив',
}

export default function GroupsTable({
  user,
  groups,
}: {
  user: UserData
  groups: GroupWithTeacherAndCourse[]
}) {
  const { users } = useData()
  const columns = getColumns(users.flatMap((user) => user.firstName))

  return (
    <DataTable
      data={groups}
      columns={columns}
      paginate
      defaultFilters={
        user.role == 'TEACHER' ? [{ id: 'teacher', value: user.firstName }] : undefined
      }
    />
  )
}

function RowActions({ item }: { item: GroupWithTeacherAndCourse }) {
  const [isUpdatePending, startUpdateTransition] = useTransition()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [groupName, setGroupName] = useState('')

  const handleDelete = () => {
    startUpdateTransition(() => {
      const ok = deleteGroup(item.id)

      toast.promise(ok, {
        loading: 'Загрузка...',
        success: 'Группа успешно удалена',
        error: (e) => e.message,
      })
    })
  }

  return (
    <div className="flex items-center justify-end">
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size={'icon'}>
            <Trash className="stroke-rose-400" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Вы уверены, что хотите удалить группу <strong>{item.name}</strong>?{' '}
            </AlertDialogTitle>
            <AlertDialogDescription>
              При удалении группы, будут удалены все связанные с ней сущности: уроки, посещаемость,{' '}
              <strong>оплаты</strong>. Это действие нельзя будет отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div>
            <Label className="text-muted-foreground text-sm font-medium">
              Введите название группы для подтверждения удаления:
            </Label>
            <Input
              placeholder={item.name}
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdatePending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isUpdatePending || groupName !== item.name}
              className="bg-destructive hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
