// components/UpcomingLessons.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import prisma from '@/lib/prisma'

export async function UpcomingLessons() {
  const now = new Date()
  const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  const upcomingLessons = await prisma.lesson.findMany({
    where: {
      date: {
        gte: now,
        lte: twentyFourHoursLater,
      },
    },
    include: {
      group: {
        select: {
          name: true,
          teacher: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
    orderBy: {
      date: 'asc',
    },
  })

  if (upcomingLessons.length === 0) {
    return (
      <p className="text-muted-foreground text-center">
        Нет предстоящих уроков в ближайшие 24 часа.
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Группа</TableHead>
          <TableHead>Преподаватель</TableHead>
          <TableHead>Дата</TableHead>
          <TableHead>Время</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {upcomingLessons.map((lesson) => (
          <TableRow key={lesson.id}>
            <TableCell>{lesson.group.name}</TableCell>
            <TableCell>{`${lesson.group.teacher.firstName} ${lesson.group.teacher.lastName}`}</TableCell>
            <TableCell>{lesson.date.toLocaleDateString()}</TableCell>
            <TableCell>{lesson.time}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
