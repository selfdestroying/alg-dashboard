'use client'

import { useDebounce } from '@/hooks/use-debounce'
import { cn } from '@/lib/utils'
import { useEffect, useRef, useTransition } from 'react'
import { toast } from 'sonner'
import { Input } from './ui/input'

type DebouncedInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange'
> & {
  initValue?: string | number
  delay?: number
  onDebouncedChange?: (val: string | number) => void | Promise<void>
  showToast?: boolean
}

export default function DebouncedInput({
  initValue = '',
  delay = 500,
  onDebouncedChange,
  showToast = false,
  ...props
}: DebouncedInputProps) {
  const [debouncedValue, setDebouncedValue] = useDebounce(initValue, delay)
  const [, startTransition] = useTransition()

  const isFirstRender = useRef(true)

  useEffect(() => {
    setDebouncedValue(initValue)
  }, [initValue])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    if (onDebouncedChange) {
      startTransition(() => {
        const ok = Promise.resolve(onDebouncedChange(debouncedValue))
        if (showToast)
          toast.promise(ok, {
            loading: 'Загрузка...',
            success: 'Успешно!',
            error: (e) => e.message,
          })
      })
    }
  }, [debouncedValue, showToast])

  return (
    <Input
      {...props}
      className={cn('peer bg-gradient-to-br', props.className)}
      value={debouncedValue}
      onChange={(e) => setDebouncedValue(e.target.value)}
      // disabled={isPending}
    />
  )
}
