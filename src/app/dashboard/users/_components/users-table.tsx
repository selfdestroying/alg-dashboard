'use client'
import { UserData } from "@/actions/users";
import DataTable from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Prisma, User } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import UsersActions from "./users-actions";
import { useData } from "@/providers/data-provider";



interface UsersTableProps {
    users: UserData[]
}

const userRoleMap = {
    ADMIN: 'Админ',
    OWNER: 'Владелец',
    TEACHER: 'Учитель',
    MANAGER: 'Менеджер',
}


const getColumns = (): ColumnDef<UserData>[] => [
    {
        header: 'Полное имя',
        accessorKey: 'fullName',
        accessorFn: (value) => `${value.firstName} ${value.lastName}`,
        cell: ({ row }) => (
            <Button asChild variant={'link'} size={'sm'} className="">
                <Link href={`/dashboard/users/${row.original.id}`}>
                    {row.original.firstName} {row.original.lastName}
                </Link>
            </Button>
        ),
        meta: {
            filterVariant: 'text',
        },
    },
    {
        header: 'Роль',
        accessorKey: 'role',
        accessorFn: (value) => userRoleMap[value.role],
    },
    {
        header: 'Ставка за урок',
        accessorKey: 'bidForLesson'
    },
    {
        header: 'Ставка за индив',
        accessorKey: 'bidForIndividual'
    }
]

export default function UsersTable({ users }: UsersTableProps) {
    const columns = getColumns()
    const { user } = useData()

    if (user?.role !== 'TEACHER') {
        columns.push({
            id: 'actions',
            cell: ({ row }) => (
                <div className="flex justify-end">
                    <UsersActions
                        userId={row.original.id}
                        userName={`${row.original.firstName} ${row.original.lastName}`}
                    />
                </div>
            ),
            size: 50,
        })
    }
    return <DataTable data={users} columns={columns} paginate />
}