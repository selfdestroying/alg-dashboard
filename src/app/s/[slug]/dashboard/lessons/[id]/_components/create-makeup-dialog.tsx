import { getLessons } from '@/src/actions/lessons'
import { Button } from '@/src/components/ui/button'
import { Calendar, CalendarDayButton } from '@/src/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import { getGroupName } from '@/src/lib/utils'
import { format } from 'date-fns'
import { fromZonedTime } from 'date-fns-tz'
import { ru } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { Dispatch, SetStateAction, useState } from 'react'

interface CreateMakeUpDialogProps {
  selectedLesson: { label: string; value: number } | null
  setSelectedLesson: Dispatch<SetStateAction<{ label: string; value: number } | null>>
}

export default function CreateMakeUpForm({
  selectedLesson,
  setSelectedLesson,
}: CreateMakeUpDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [lessons, setLessons] = useState<{ label: string; value: number }[]>([])

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date)
    const zodedDate = fromZonedTime(date, 'Europe/Moscow')
    getLessons({
      where: { date: zodedDate },
      include: {
        attendance: { include: { student: true } },
        group: {
          include: {
            teachers: {
              include: {
                teacher: true,
              },
            },
            course: true,
            location: true,
          },
        },
      },
    }).then((l) => {
      setLessons(
        l.map((lesson) => ({
          label: `${getGroupName(lesson.group)} - ${lesson.group.teachers
            .map((teacher) => `${teacher.teacher.firstName} ${teacher.teacher.lastName ?? ''}`)
            .join(', ')}`,
          value: lesson.id,
        }))
      )
      console.log(lessons)
    })
  }

  return (
    <div className="space-y-2">
      <Popover modal>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
              size={'sm'}
            />
          }
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? format(selectedDate, 'dd.MM.yyyy') : 'Выбрать дату'}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            onSelect={handleSelectDate}
            locale={ru}
            selected={selectedDate}
            required
            components={{
              DayButton: (props) => (
                <CalendarDayButton
                  {...props}
                  data-day={props.day.date.toLocaleDateString('ru-RU')}
                />
              ),
            }}
          />
        </PopoverContent>
      </Popover>

      <Select items={lessons} value={selectedLesson} onValueChange={setSelectedLesson}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Выберите урок" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {lessons.map((lesson) => (
              <SelectItem key={lesson.value} value={lesson}>
                {lesson.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
