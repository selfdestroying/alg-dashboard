'use client'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Check, Minus, X } from 'lucide-react'
import { useState } from 'react'

type AttendanceStatus = 'absent' | 'unspecified' | 'present'

export function AttendanceStatusSwitcher() {
  const [status, setStatus] = useState<AttendanceStatus>('unspecified')
  return (
    <ToggleGroup
      type="single"
      variant={'outline'}
      size={'sm'}
      value={status}
      onValueChange={(v) => v && setStatus(v as AttendanceStatus)}
    >
      <Tooltip key={'absent'} delayDuration={500}>
        <TooltipTrigger
          asChild
          className="group h-6 disabled:border-red-300 disabled:bg-red-100 disabled:opacity-100 disabled:dark:border-red-800 disabled:dark:bg-red-900/20"
        >
          <ToggleGroupItem value="absent" aria-label="absent" disabled={status === 'absent'}>
            <X className="group-disabled:stroke-red-700 group-disabled:dark:stroke-red-300" />
          </ToggleGroupItem>
        </TooltipTrigger>
        <TooltipContent>
          <p>Отсутствует</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip key={'unspecified'} delayDuration={500}>
        <TooltipTrigger
          asChild
          className="group disabled:border-input disabled:bg-accent h-6 disabled:opacity-100"
        >
          <ToggleGroupItem
            value="unspecified"
            aria-label="unspecified"
            disabled={status === 'unspecified'}
          >
            <Minus className="group-disabled:stroke-gray-700 group-disabled:dark:stroke-gray-300" />
          </ToggleGroupItem>
        </TooltipTrigger>
        <TooltipContent>
          <p>Не отмечен</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip key={'present'} delayDuration={500}>
        <TooltipTrigger
          asChild
          className="group h-6 disabled:border-emerald-300 disabled:bg-emerald-100 disabled:opacity-100 disabled:dark:border-emerald-800 disabled:dark:bg-emerald-900/20"
        >
          <ToggleGroupItem value="present" aria-label="present" disabled={status === 'present'}>
            <Check className="group-disabled:stroke-emerald-700 group-disabled:dark:stroke-emerald-300" />
          </ToggleGroupItem>
        </TooltipTrigger>
        <TooltipContent>
          <p>Присутствует</p>
        </TooltipContent>
      </Tooltip>
    </ToggleGroup>
  )
}
