'use client'

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import AddRentButton from './add-rent-button'
import RentTable from './rent-table'

export default function RentExpenses() {
  return (
    <div className="grid min-h-0 flex-1 grid-cols-1">
      <Card>
        <CardHeader>
          <CardTitle>Аренда</CardTitle>
          <CardDescription>Расходы на аренду помещений по локациям</CardDescription>
          <CardAction>
            <AddRentButton />
          </CardAction>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <RentTable />
        </CardContent>
      </Card>
    </div>
  )
}
