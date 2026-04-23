'use client'

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import AddManagerSalaryButton from './add-manager-salary-button'
import ManagerSalariesTable from './manager-salaries-table'

export default function ManagerSalaries() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ставки менеджеров</CardTitle>
        <CardDescription>История фиксированных ставок по каждому менеджеру.</CardDescription>
        <CardAction>
          <AddManagerSalaryButton />
        </CardAction>
      </CardHeader>
      <CardContent>
        <ManagerSalariesTable />
      </CardContent>
    </Card>
  )
}
