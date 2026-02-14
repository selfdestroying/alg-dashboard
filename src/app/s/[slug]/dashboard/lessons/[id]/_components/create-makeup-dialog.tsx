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
import { Skeleton } from '@/src/components/ui/skeleton'
import { useMappedLessonListQuery } from '@/src/data/lesson/lesson-list-query'
import { useSessionQuery } from '@/src/data/user/session-query'
import { format, startOfDay } from 'date-fns'
import { ru } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { Dispatch, SetStateAction, useMemo, useState } from 'react'

interface CreateMakeUpDialogProps {
  selectedLesson: { label: string; value: number } | null
  setSelectedLesson: Dispatch<SetStateAction<{ label: string; value: number } | null>>
}

export default function CreateMakeUpForm({
  selectedLesson,
  setSelectedLesson,
}: CreateMakeUpDialogProps) {
  const { data: session, isLoading: isSessionLoading } = useSessionQuery()
  const organizationId = session?.organizationId
  const [selectedDay, setSelectedDay] = useState<Date | undefined>()
  const dayKey = useMemo(() => selectedDay && startOfDay(selectedDay), [selectedDay])
  const { data: lessons, isLoading: isLessonsLoading } = useMappedLessonListQuery(
    organizationId!,
    dayKey
  )

  if (isSessionLoading) {
    return <Skeleton className="h-full w-full" />
  }

  return (
    <div className="space-y-2">
      <Popover modal>
        <PopoverTrigger
          render={
            <Button variant="outline" className="w-full justify-start text-left font-normal" />
          }
        >
          <CalendarIcon />
          {selectedDay ? format(selectedDay, 'dd.MM.yyyy') : 'Выбрать дату'}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            onSelect={setSelectedDay}
            locale={ru}
            selected={selectedDay}
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

      <Select
        items={lessons}
        value={selectedLesson}
        onValueChange={setSelectedLesson}
        disabled={isLessonsLoading}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Выберите урок" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {lessons?.map((lesson) => (
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
