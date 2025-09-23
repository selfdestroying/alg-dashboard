'use client'
import { useEffect, useState } from 'react'
import { Input } from './ui/input'

export default function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value])

  return (
    <Input
      className="peer min-w-60 bg-gradient-to-br ps-9"
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  )
}
