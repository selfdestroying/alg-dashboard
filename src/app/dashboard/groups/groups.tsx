'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { ArrowUpDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { IStudent } from '../students/students'

export interface IGroups {
  id: number
  name: string
  course: string
  students: number
}
export interface IGroup {
  id: number
  name: string
  course: string
  students: IStudent[]
}

export const columns: ColumnDef<IGroups>[] = [
  {
    accessorKey: 'name',
    cell: ({ row }) => (
      <Button variant={'link'} className="w-full p-0 h-fit">
        <Link href={`/dashboard/groups/${row.original.id}`} className="w-full text-start">
          {row.original.name}
        </Link>
      </Button>
    ),
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: 'course',
    cell: ({ row }) => (
      <div className="w-32">
        <Badge variant="outline" className="text-muted-foreground">
          {row.original.course}
        </Badge>
      </div>
    ),
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Course
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: 'students',
    cell: ({ row }) => row.original.students,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Students
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
]
