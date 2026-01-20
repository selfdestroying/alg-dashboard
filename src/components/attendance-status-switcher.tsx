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

  const handleChange = (newStatus: AttendanceStatus[]) => {
    if (newStatus[0] === status) return

    startTransition(async () => {
      await updateAttendance({
        where: {
          studentId_lessonId: {
            studentId: studentId,
            lessonId: lessonId,
          },
        },
        data: {
          status: newStatus[0],
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
      <Tooltip key={'absent'}>
        {isPending ? (
          <TooltipTrigger
            render={
              <ToggleGroupItem value={AttendanceStatus.ABSENT} aria-label="absent" disabled />
            }
            className="h-6"
          >
            <Loader2 className="animate-spin" />
          </TooltipTrigger>
        ) : (
          <TooltipTrigger
            render={
              <ToggleGroupItem
                value={AttendanceStatus.ABSENT}
                aria-label="absent"
                disabled={status === AttendanceStatus.ABSENT || isPending}
              />
            }
            className="group h-6 cursor-pointer disabled:border-red-300 disabled:bg-red-100 disabled:opacity-100 disabled:dark:border-red-800 disabled:dark:bg-red-900/20"
          >
            <X className="group-disabled:stroke-red-700 group-disabled:dark:stroke-red-300" />
          </TooltipTrigger>
        )}
        <TooltipContent>
          <p>Отсутствует</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip key={'unspecified'}>
        {isPending ? (
          <TooltipTrigger
            render={
              <ToggleGroupItem value={AttendanceStatus.UNSPECIFIED} aria-label="absent" disabled />
            }
            className="h-6"
          >
            <Loader2 className="animate-spin" />
          </TooltipTrigger>
        ) : (
          <TooltipTrigger
            render={
              <ToggleGroupItem
                value={AttendanceStatus.UNSPECIFIED}
                aria-label="unspecified"
                disabled={status === AttendanceStatus.UNSPECIFIED || isPending}
              />
            }
            className="group disabled:border-input disabled:bg-accent h-6 cursor-pointer disabled:opacity-100"
          >
            <Minus className="group-disabled:stroke-gray-700 group-disabled:dark:stroke-gray-300" />
          </TooltipTrigger>
        )}
        <TooltipContent>
          <p>Не отмечен</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip key={'present'}>
        {isPending ? (
          <TooltipTrigger
            render={
              <ToggleGroupItem value={AttendanceStatus.PRESENT} aria-label="absent" disabled />
            }
            className="h-6"
          >
            <Loader2 className="animate-spin" />
          </TooltipTrigger>
        ) : (
          <TooltipTrigger
            render={
              <ToggleGroupItem
                value={AttendanceStatus.PRESENT}
                aria-label="present"
                disabled={status === AttendanceStatus.PRESENT || isPending}
              />
            }
            className="group h-6 cursor-pointer disabled:border-emerald-300 disabled:bg-emerald-100 disabled:opacity-100 disabled:dark:border-emerald-800 disabled:dark:bg-emerald-900/20"
          >
            <Check className="group-disabled:stroke-emerald-700 group-disabled:dark:stroke-emerald-300" />
          </TooltipTrigger>
        )}
        <TooltipContent>
          <p>Присутствует</p>
        </TooltipContent>
      </Tooltip>
    </ToggleGroup>
  )
}
