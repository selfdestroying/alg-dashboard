'use client'
import { updateAttendance } from '@/actions/attendance'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Toggle } from '@/components/ui/toggle'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { usePermission } from '@/hooks/usePermission'
import { Attendance, AttendanceStatus } from '@prisma/client'
import { cva } from 'class-variance-authority'
import { AlertCircle, Check, Loader, Minus, X } from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'

interface AttendanceStatusSwitcherProps {
  attendance: Attendance
}

const switcherVariant = cva(['cursor-pointer'], {
  variants: {
    variant: {
      absent: {},
      present: {},
      unspecified: {},
    },
    active: {
      true: {},
      false: {},
    },
  },
  compoundVariants: [
    {
      variant: 'absent',
      active: true,
      className:
        'border-destructive aria-pressed:bg-destructive/20 text-destructive aria-pressed:opacity-100',
    },
    {
      variant: 'absent',
      active: false,
      className: '',
    },
    {
      variant: 'present',
      active: true,
      className: 'border-success aria-pressed:bg-success/20 text-success aria-pressed:opacity-100',
    },
    {
      variant: 'present',
      active: false,
      className: '',
    },
    {
      variant: 'unspecified',
      active: true,
      className: '',
    },
    {
      variant: 'unspecified',
      active: false,
      className: '',
    },
  ],
})

export function AttendanceStatusSwitcher({ attendance }: AttendanceStatusSwitcherProps) {
  const canSelectWarned = usePermission('SELECT_WARNED')
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<AttendanceStatus>(attendance.status)
  const [isWarned, setIsWarned] = useState<boolean | null>(attendance.isWarned)
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false)

  useEffect(() => {
    if (status === attendance.status) return

    startTransition(async () => {
      await updateAttendance({
        where: {
          studentId_lessonId: {
            studentId: attendance.studentId,
            lessonId: attendance.lessonId,
          },
        },
        data: {
          status,
          isWarned,
        },
      })
    })
  }, [status, isWarned, attendance.lessonId, attendance.studentId, attendance.status])

  return (
    <TooltipProvider delay={300}>
      <div className="flex items-center gap-2">
        {canSelectWarned ? (
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <Tooltip>
              <TooltipTrigger
                render={
                  <PopoverTrigger
                    render={
                      <Toggle
                        size={'sm'}
                        variant="outline"
                        className={switcherVariant({
                          variant: 'absent',
                          active: status === 'ABSENT',
                        })}
                        pressed={status === 'ABSENT'}
                        disabled={isPending || status === 'ABSENT'}
                      >
                        {isPending ? <Loader className="animate-spin" /> : <X />}
                      </Toggle>
                    }
                  />
                }
              />

              <TooltipContent>
                <p>Отсутствует</p>
              </TooltipContent>
            </Tooltip>

            <PopoverContent className="w-fit">
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant={'destructive'}
                  onClick={() => {
                    setStatus('ABSENT')
                    setPopoverOpen(false)
                  }}
                >
                  Не предупредили (-1)
                </Button>
                <Button
                  className="bg-success/10 text-success hover:bg-success/20"
                  onClick={() => {
                    setStatus('ABSENT')
                    setIsWarned(true)
                    setPopoverOpen(false)
                  }}
                >
                  Предупредили (0)
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          <Tooltip>
            <TooltipTrigger
              render={
                <Toggle
                  size={'sm'}
                  variant="outline"
                  className={switcherVariant({
                    variant: 'absent',
                    active: status === 'ABSENT',
                  })}
                  pressed={status === 'ABSENT'}
                  onClick={() => {
                    setStatus('ABSENT')
                    setIsWarned(false)
                  }}
                  disabled={isPending || status === 'ABSENT'}
                >
                  {isPending ? <Loader className="animate-spin" /> : <X />}
                </Toggle>
              }
            />

            <TooltipContent>
              <p>Отсутствует</p>
            </TooltipContent>
          </Tooltip>
        )}

        <Tooltip>
          <TooltipTrigger
            render={
              <Toggle
                size={'sm'}
                variant="outline"
                className={switcherVariant({ variant: 'unspecified', active: isPending })}
                pressed={status === 'UNSPECIFIED'}
                onClick={() => {
                  setStatus('UNSPECIFIED')
                  setIsWarned(null)
                }}
                disabled={isPending || status === 'UNSPECIFIED'}
              >
                {isPending ? <Loader className="animate-spin" /> : <Minus />}
              </Toggle>
            }
          />

          <TooltipContent>
            <p>Не отмечен</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            className={switcherVariant({ variant: 'present', active: status === 'PRESENT' })}
            render={
              <Toggle
                size={'sm'}
                variant="outline"
                pressed={status === 'PRESENT'}
                onClick={() => {
                  setStatus('PRESENT')
                  setIsWarned(null)
                }}
                disabled={isPending || status === 'PRESENT'}
              >
                {isPending ? <Loader className="animate-spin" /> : <Check />}
              </Toggle>
            }
          />

          <TooltipContent>
            <p>Присутствует (-1)</p>
          </TooltipContent>
        </Tooltip>
        {isWarned !== null && isWarned && (
          <Tooltip>
            <TooltipTrigger render={<AlertCircle className="text-warning size-4" />} />
            <TooltipContent>Предупредили</TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  )
}
