import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { apiGet, apiPost } from '@/lib/api/api-server'
import { cn } from '@/lib/utils'
import { IGroup } from '@/types/group'
import { IPayment } from '@/types/payments'
import { IStudent } from '@/types/student'

export default async function Page() {
  const payments = await apiGet<IPayment[]>('payments')
  const students = await apiGet<IStudent[]>('students')
  const groups = await apiGet<IGroup[]>('groups')
  if (!payments.success || !students.success || !groups.success) return <div>Error</div>
  const handleSubmit = async (formData: FormData) => {
    'use server'
    console.log(formData)
    const body = {
      studentId: formData.get('student'),
      groupId: formData.get('group'),
      classesAmount: formData.get('classesAmount'),
    }
    await apiPost('payments', body, '/dashboard/payments')
  }
  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button size={'sm'} className="cursor-pointer">
            Добавить оплату
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Добавить оплату</DialogTitle>
          <DialogDescription>Добавить новую оплату</DialogDescription>
          <form action={handleSubmit}>
            <div>
              <Label>Ученик</Label>
              <Select name="student">
                <SelectTrigger>
                  <SelectValue placeholder="Выбери ученика" />
                </SelectTrigger>
                <SelectContent>
                  {students.data.map((student) => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Группа</Label>
              <Select name="group">
                <SelectTrigger>
                  <SelectValue placeholder="Выбери группу" />
                </SelectTrigger>
                <SelectContent>
                  {groups.data.map((group) => (
                    <SelectItem key={group.id} value={group.id.toString()}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Количество занятий</Label>
              <Input name="classesAmount" type="number" />
            </div>
            <Button className="cursor-pointer">Добавить</Button>
          </form>
        </DialogContent>
      </Dialog>
      <Table>
        <TableCaption>A list of your recent invoices.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Имя</TableHead>
            <TableHead>Группа</TableHead>
            <TableHead>Всего занятий оплачено</TableHead>
            <TableHead>Занятий осталось</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.data.map((payment) => (
            <TableRow key={payment.student.name + payment.group.id}>
              <TableCell>{payment.student.name}</TableCell>
              <TableCell>{payment.group.name}</TableCell>
              <TableCell>{payment.totalPaidClasses}</TableCell>
              <TableCell>
                <Badge variant="outline" className="w-10 [&>svg]:size-4">
                  {payment.classesLeft === 0 ? (
                    <span className={cn('h-2 w-2 animate-pulse rounded-full', 'bg-red-500')} />
                  ) : (
                    payment.classesLeft <= 5 && (
                      <span className={cn('h-2 w-2 rounded-full', 'bg-amber-500')} />
                    )
                  )}
                  {payment.classesLeft}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
