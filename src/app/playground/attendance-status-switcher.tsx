'use client'
import { updateAttendance } from '@/actions/attendance'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { AttendanceStatus } from '@prisma/client'
import { Check, Loader2, Minus, X } from 'lucide-react'
import { useTransition } from 'react'

interface AttendanceStatusSwitcherProps {
  lessonId: number
  studentId: number
  status: AttendanceStatus
}

export function AttendanceStatusSwitcher({
  lessonId,
  studentId,
  status,
}: AttendanceStatusSwitcherProps) {
  const [isPending, startTransition] = useTransition()

  const handleChange = (newStatus: AttendanceStatus) => {
    if (newStatus === status) return

    startTransition(async () => {
      await updateAttendance({
        where: {
          studentId_lessonId: {
            studentId: studentId,
            lessonId: lessonId,
          },
        },
        data: {
          status: newStatus,
        },
      })
    })
  }

  return (
    <ToggleGroup
      type="single"
      variant={'outline'}
      size={'sm'}
      value={status}
      onValueChange={(v) => v && handleChange(v as AttendanceStatus)}
    >
      <Tooltip key={'absent'} delayDuration={500}>
        {isPending ? (
          <TooltipTrigger asChild className="h-6">
            <ToggleGroupItem value={AttendanceStatus.ABSENT} aria-label="absent" disabled>
              <Loader2 className="animate-spin" />
            </ToggleGroupItem>
          </TooltipTrigger>
        ) : (
          <TooltipTrigger
            asChild
            className="group h-6 disabled:border-red-300 disabled:bg-red-100 disabled:opacity-100 disabled:dark:border-red-800 disabled:dark:bg-red-900/20"
          >
            <ToggleGroupItem
              value={AttendanceStatus.ABSENT}
              aria-label="absent"
              disabled={status === AttendanceStatus.ABSENT || isPending}
            >
              <X className="group-disabled:stroke-red-700 group-disabled:dark:stroke-red-300" />
            </ToggleGroupItem>
          </TooltipTrigger>
        )}
        <TooltipContent>
          <p>Отсутствует</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip key={'unspecified'} delayDuration={500}>
        {isPending ? (
          <TooltipTrigger asChild className="h-6">
            <ToggleGroupItem value={AttendanceStatus.UNSPECIFIED} aria-label="absent" disabled>
              <Loader2 className="animate-spin" />
            </ToggleGroupItem>
          </TooltipTrigger>
        ) : (
          <TooltipTrigger
            asChild
            className="group disabled:border-input disabled:bg-accent h-6 disabled:opacity-100"
          >
            <ToggleGroupItem
              value={AttendanceStatus.UNSPECIFIED}
              aria-label="unspecified"
              disabled={status === AttendanceStatus.UNSPECIFIED || isPending}
            >
              <Minus className="group-disabled:stroke-gray-700 group-disabled:dark:stroke-gray-300" />
            </ToggleGroupItem>
          </TooltipTrigger>
        )}
        <TooltipContent>
          <p>Не отмечен</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip key={'present'} delayDuration={500}>
        {isPending ? (
          <TooltipTrigger asChild className="h-6">
            <ToggleGroupItem value={AttendanceStatus.PRESENT} aria-label="absent" disabled>
              <Loader2 className="animate-spin" />
            </ToggleGroupItem>
          </TooltipTrigger>
        ) : (
          <TooltipTrigger
            asChild
            className="group h-6 disabled:border-emerald-300 disabled:bg-emerald-100 disabled:opacity-100 disabled:dark:border-emerald-800 disabled:dark:bg-emerald-900/20"
          >
            <ToggleGroupItem
              value={AttendanceStatus.PRESENT}
              aria-label="present"
              disabled={status === AttendanceStatus.PRESENT || isPending}
            >
              <Check className="group-disabled:stroke-emerald-700 group-disabled:dark:stroke-emerald-300" />
            </ToggleGroupItem>
          </TooltipTrigger>
        )}
        <TooltipContent>
          <p>Присутствует</p>
        </TooltipContent>
      </Tooltip>
    </ToggleGroup>
  )
}
