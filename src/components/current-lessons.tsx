import { getUpcomingLessons } from '@/actions/lessons'
import { getUser } from '@/actions/users'
import prisma from '@/lib/prisma'
import { Attendance, AttendanceStatus } from '@prisma/client'
import { AttendanceTable } from './tables/attendance-table'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

export async function CurrentLessons() {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const user = await getUser()

  const lessonsToday = await prisma.lesson.findMany({
    where: {
      date: { equals: today },
      group: user?.role == 'TEACHER' ? { teacherId: user?.id } : undefined,
    },
    include: {
      attendance: {
        include: {
          student: true,
          asMakeupFor: { include: { missedAttendance: { include: { lesson: true } } } },
          missedMakeup: { include: { makeUpAttendance: { include: { lesson: true } } } },
        },
      },
      group: { include: { teacher: true } },
    },
  })
  const upcomingLessons = await getUpcomingLessons()
  if (lessonsToday.length === 0) {
    return (
      <p className="text-muted-foreground py-4 text-center text-sm">
        Нет активных уроков в данный момент.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {/* Уменьшаем space-y для карточек */}
      {lessonsToday.map((lesson) => (
        <div key={lesson.id} className="rounded-lg border p-3">
          {/* Уменьшаем padding карточки */}
          {/* Верхняя секция с основной информацией об уроке */}
          <div className="grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-muted-foreground text-xs font-medium">Группа</p>
              <p className="text-base font-semibold">{lesson.group.name}</p> {/* Меньший шрифт */}
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium">Преподаватель</p>
              <p className="text-base font-semibold">{lesson.group.teacher.firstName}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4">
              <div>
                <p className="text-muted-foreground text-xs">Всего</p> {/* Меньший шрифт */}
                <p className="text-xl font-bold">{lesson.attendance.length}</p>{' '}
                {/* Меньший шрифт */}
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Присутст.</p>
                <p className="text-xl font-bold text-emerald-500">
                  {lesson.attendance.filter((a) => a.status == 'PRESENT').length}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Не пришли</p>
                <p className="text-xl font-bold text-amber-500">
                  {lesson.attendance.filter((a) => a.status == 'ABSENT').length}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Не отмечены</p>
                <p className="text-xl font-bold text-rose-500">
                  {lesson.attendance.filter((a) => a.status == 'UNSPECIFIED').length}
                </p>
              </div>
            </div>
          </div>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Статус посещаемости учеников:</AccordionTrigger>
              <AccordionContent>
                <div className="overflow-x-auto">
                  <AttendanceTable
                    attendance={lesson.attendance}
                    upcomingLessons={upcomingLessons}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      ))}
    </div>
  )
}

const StatusMap: { [key in AttendanceStatus]: string } = {
  ABSENT: 'Пропустил',
  PRESENT: 'Пришел',
  UNSPECIFIED: 'Не отмечен',
}

function StatusAction({
  value,
  onChange,
}: {
  value: Attendance
  onChange: (val: AttendanceStatus) => void
}) {
  return (
    <Select
      value={value.status != 'UNSPECIFIED' ? value.status : undefined}
      onValueChange={(e: AttendanceStatus) => onChange(e)}
    >
      <SelectTrigger size="sm" className="">
        <SelectValue placeholder={StatusMap['UNSPECIFIED']} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={AttendanceStatus.PRESENT}>
          <div className="bg-success size-2 rounded-full" aria-hidden="true"></div>
          {StatusMap.PRESENT}
        </SelectItem>
        <SelectItem value={AttendanceStatus.ABSENT}>
          <div className="bg-error size-2 rounded-full" aria-hidden="true"></div>
          {StatusMap.ABSENT}
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
