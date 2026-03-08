'use client'

import { updateStudent } from '@/src/actions/students'
import { Button } from '@/src/components/ui/button'
import { Field } from '@/src/components/ui/field'
import { Input } from '@/src/components/ui/input'
import { Loader, Plus } from 'lucide-react'
import { useState, useTransition } from 'react'

interface AddCoinsFormProps {
  studentId: number
}

export default function AddCoinsForm({ studentId }: AddCoinsFormProps) {
  const [inc, setInc] = useState<number | undefined>()
  const [isPending, startTransition] = useTransition()

  const handleAddCoins = () => {
    startTransition(() => {
      if (inc) {
        updateStudent({
          where: { id: studentId },
          data: {
            coins: { increment: inc },
          },
        })
        setInc(undefined)
      }
    })
  }

  return (
    <Field orientation="horizontal">
      <Input
        className="w-24"
        type="number"
        value={inc ?? ''}
        onChange={(e) => setInc(Number(e.target.value))}
        disabled={isPending}
      />
      <Button size="icon" onClick={handleAddCoins} disabled={isPending || !inc}>
        {isPending ? <Loader className="animate-spin" /> : <Plus />}
      </Button>
    </Field>
  )
}
