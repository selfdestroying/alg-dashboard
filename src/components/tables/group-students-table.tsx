'use client'
import { getGroup, removeFromGroup } from '@/actions/groups'
import DataTable from '@/components/data-table'
import DeleteAction from '@/components/delete-action'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Lesson, Prisma, StudentGroup, StudentStatus } from '@prisma/client'
import { ColumnDef } from '@tanstack/react-table'
import { DoorOpen } from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'

type StudentWithAttendances = Prisma.StudentGetPayload<{
  include: {
    groups: true

    attendances: {
      where: { lesson: { groupId: number } }
      include: {
        lesson: true
        asMakeupFor: { include: { missedAttendance: { include: { lesson: true } } } }
        missedMakeup: { include: { makeUpAttendance: { include: { lesson: true } } } }
      }
    }
  }
}>

// -------------------- Columns --------------------
const getColumns = (groupId: number): ColumnDef<StudentWithAttendances>[] => [
  {
    id: '№',
    header: '№',
    cell: ({ row }) => row.index + 1,
    size: 10,
  },
  {
    header: 'Полное имя',
    accessorFn: (student) => `${student.firstName} ${student.lastName}`,
    cell: ({ row }) => (
      <Button asChild variant="link" className="h-fit p-0 font-medium">
        <Link href={`/dashboard/students/${row.original.id}`}>
          {row.original.firstName} {row.original.lastName}
        </Link>
      </Button>
    ),
    meta: { filterVariant: 'text' },
  },
  // {
  //   header: 'Статус',
  //   accessorFn: (item) => item.groups[0].status,
  //   cell: ({ row }) => (
  //     <StudentStatusAction
  //       defaultValue={row.original.groups[0]}
  //       onChange={(studentStatus: StudentStatus) => {
  //         const ok = updateStudentGroup({
  //           where: {
  //             studentId_groupId: {
  //               groupId: row.original.groups[0].groupId,
  //               studentId: row.original.id,
  //             },
  //           },
  //           data: { status: studentStatus },
  //         })
  //         toast.promise(ok, {
  //           loading: 'Загрузка...',
  //           success: 'Успешно!',
  //           error: (e) => e.message,
  //         })
  //       }}
  //     />
  //   ),
  //   meta: { filterVariant: 'select', allFilterVariants: Object.keys(StudentStatus) },
  // },

  { header: 'Возраст', accessorKey: 'age', meta: { filterVariant: 'range' } },
  { header: 'ФИО Родителя', accessorKey: 'parentsName', meta: { filterVariant: 'text' } },
  {
    header: 'Ссылка в amoCRM',
    accessorKey: 'crmUrl',
    cell: ({ row }) => (
      <Button asChild variant="link" className="h-fit w-fit p-0 font-medium">
        <a target="_blank" href={row.getValue('crmUrl') || '#'}>
          {row.getValue('crmUrl') || 'Нет ссылки'}
        </a>
      </Button>
    ),
    meta: { filterVariant: 'text' },
  },
  { accessorKey: 'login', header: 'Логин', meta: { filterVariant: 'text' } },
  { accessorKey: 'password', header: 'Пароль', meta: { filterVariant: 'text' } },
  { accessorKey: 'coins', header: 'Астрокоины', meta: { filterVariant: 'range' } },
  {
    id: 'actions',
    header: 'Действия',
    cell: ({ row }) => (
      <>
        <Button variant={'ghost'} size={'icon'}>
          <DoorOpen className="stroke-error" />
        </Button>
        <DeleteAction
          id={row.original.id}
          action={() => removeFromGroup({ studentId: row.original.id, groupId })}
          confirmationText={`${row.original.firstName} ${row.original.lastName}`}
        />
      </>
    ),
  },
]

// -------------------- Main Component --------------------
export function GroupStudentsTable({
  lessons,
  students,
  data,
}: {
  data: Awaited<ReturnType<typeof getGroup>>
  lessons: Lesson[]
  students: StudentWithAttendances[]
}) {
  const columns = useMemo(() => getColumns(data.id), [lessons, data.id])

  return <DataTable data={students} columns={columns} paginate={false} />
}

const StudentStatusMap: { [key in StudentStatus]: string } = {
  ACTIVE: 'Ученик',
  DISMISSED: 'Отчислен',
  TRIAL: 'Пробный',
}

function StudentStatusAction({
  defaultValue,
  onChange,
}: {
  defaultValue: StudentGroup
  onChange: (val: StudentStatus) => void
}) {
  return (
    <Select defaultValue={defaultValue.status} onValueChange={(e: StudentStatus) => onChange(e)}>
      <SelectTrigger size="sm" className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={StudentStatus.ACTIVE}>
          <div className="space-x-2">
            <div className="bg-success inline-block size-2 rounded-full" aria-hidden="true"></div>
            <span>{StudentStatusMap.ACTIVE}</span>
          </div>
        </SelectItem>
        <SelectItem value={StudentStatus.TRIAL}>
          <div className="space-x-2">
            <div className="bg-info inline-block size-2 rounded-full" aria-hidden="true"></div>
            <span>{StudentStatusMap.TRIAL}</span>
          </div>
        </SelectItem>
        <SelectItem value={StudentStatus.DISMISSED}>
          <div className="space-x-2">
            <div className="bg-error inline-block size-2 rounded-full" aria-hidden="true"></div>
            <span>{StudentStatusMap.DISMISSED}</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
