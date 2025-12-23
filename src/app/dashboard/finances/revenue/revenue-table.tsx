'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Calendar, ChevronsUpDown, User } from 'lucide-react'

export interface StudentPayment {
  name: string
  revenue: number
}

export interface Lesson {
  time: string
  group: string
  revenue: number
  teacher: string
  students: StudentPayment[]
}

export interface RevenueDay {
  date: string
  revenue: number
  lessons: Lesson[]
}

interface RevenueTableProps {
  data: RevenueDay[]
}

export function RevenueTable({ data }: RevenueTableProps) {
  return data.map((day) => (
    <Collapsible key={day.date}>
      <Card className="shadow-sm transition hover:shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="text-muted-foreground h-5 w-5" />
              {day.date} -{' '}
              {day.revenue > 0 ? (
                <span className="text-success font-medium">
                  {day.revenue.toLocaleString('ru-RU')} ₽
                </span>
              ) : (
                <span className="text-muted-foreground">0 ₽</span>
              )}
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <ChevronsUpDown />
                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>
          </CardTitle>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-2">
            {day.lessons.map((lesson, i) => {
              return (
                <Collapsible key={i}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="text-muted-foreground h-5 w-5" />
                          {lesson.group} -
                          {lesson.revenue > 0 ? (
                            <span className="text-success font-medium">
                              {lesson.revenue.toLocaleString('ru-RU')} ₽
                            </span>
                          ) : (
                            <span className="text-muted-foreground">0 ₽</span>
                          )}
                        </div>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <ChevronsUpDown />
                            <span className="sr-only">Toggle</span>
                          </Button>
                        </CollapsibleTrigger>
                      </CardTitle>
                    </CardHeader>

                    <CollapsibleContent>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Ученик</TableHead>
                              <TableHead className="text-right">Выручка</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {lesson.students.map((student, j) => (
                              <TableRow key={j}>
                                <TableCell className="flex items-center gap-2">
                                  <User className="text-muted-foreground h-4 w-4" />
                                  {student.name}
                                </TableCell>
                                <TableCell className="text-right">
                                  {student.revenue > 0 ? (
                                    <span className="text-success font-medium">
                                      {student.revenue.toLocaleString('ru-RU')} ₽
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground">0 ₽</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              )
            })}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  ))
}
