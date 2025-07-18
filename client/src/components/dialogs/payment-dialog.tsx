'use client'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '../ui/button'
import PaymentForm from '../forms/payment-form'
import { useEffect, useState } from 'react'
import { getStudents } from '@/actions/students'
import { getGroups, GroupWithTeacher } from '@/actions/groups'
import { Group, Student } from '@prisma/client'

export default function PaymentDialog() {
  const [students, setStudents] = useState<Student[]>([])
  const [groups, setGroups] = useState<GroupWithTeacher[]>([])
  useEffect(() => {
    async function fetchData() {
      const s = await getStudents()
      const g = await getGroups()
      setStudents(s)
      setGroups(g)
    }
    fetchData()
  }, [])
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Добавить оплату</Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b px-6 py-4 text-base">Редактирование оплаты</DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">
          Make changes to your profile here. You can change your photo and set a username.
        </DialogDescription>
        <div className="overflow-y-auto">
          <div className="px-6 pt-4 pb-6">
            <PaymentForm students={students} groups={groups} />
          </div>
        </div>
        <DialogFooter className="border-t px-6 py-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Отмена
            </Button>
          </DialogClose>
          <Button form="payment-form">Подтвердить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
