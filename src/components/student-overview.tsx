// components/StudentOverview.tsx
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import prisma from '@/lib/prisma'

export async function StudentOverview() {
  // Пример: ученики с низким балансом (например, меньше 50 монет)
  const lowBalanceStudents = await prisma.student.findMany({
    where: {
      coins: {
        lt: 50,
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      coins: true,
    },
    orderBy: {
      coins: 'asc',
    },
  })

  // Пример: ученики без активных групп
  const studentsWithoutGroups = await prisma.student.findMany({
    where: {
      groups: {
        none: {}, // Ученики, у которых нет связанных записей в StudentGroup
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  })

  if (lowBalanceStudents.length === 0 && studentsWithoutGroups.length === 0) {
    return <p className="text-muted-foreground text-center">Нет проблемных учеников для обзора.</p>
  }

  return (
    <div>
      {lowBalanceStudents.length > 0 && (
        <>
          <h3 className="mb-2 text-lg font-semibold">Ученики с низким балансом монет</h3>
          <Table className="mb-6">
            <TableHeader>
              <TableRow>
                <TableHead>Имя</TableHead>
                <TableHead>Баланс монет</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowBalanceStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    {student.firstName} {student.lastName}
                  </TableCell>
                  <TableCell>
                    <Badge variant="destructive">{student.coins} монет</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}

      {studentsWithoutGroups.length > 0 && (
        <>
          <h3 className="mt-4 mb-2 text-lg font-semibold">Ученики без групп</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Имя</TableHead>
                <TableHead>Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentsWithoutGroups.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    {student.firstName} {student.lastName}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">Нет активной группы</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  )
}
