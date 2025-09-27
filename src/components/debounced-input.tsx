'use client'

import { useDebounce } from '@/hooks/use-debounce'
import { cn } from '@/lib/utils'
import { useEffect, useRef, useState, useTransition } from 'react'
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
  const [value, setValue] = useState(initValue)
  const debouncedValue = useDebounce(value, delay)
  const [, startTransition] = useTransition()

  const isFirstRender = useRef(true)

  useEffect(() => {
    setValue(initValue)
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
  }, [debouncedValue, onDebouncedChange, showToast])

  return (
    <Input
      {...props}
      className={cn('peer min-w-60 bg-gradient-to-br', props.className)}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      // disabled={isPending}
    />
  )
}
