'use client'

import { NumberInput } from '@/src/components/number-input'
import { Button } from '@/src/components/ui/button'
import { Field } from '@/src/components/ui/field'
import { Loader, Plus } from 'lucide-react'
import { useState } from 'react'
import { useStudentCoinsMutation } from '../../queries'

interface AddCoinsFormProps {
  studentId: number
}

export default function AddCoinsForm({ studentId }: AddCoinsFormProps) {
  const [inc, setInc] = useState<number | undefined>()
  const mutation = useStudentCoinsMutation(studentId)

  const handleAddCoins = () => {
    if (inc) {
      mutation.mutate(
        { studentId, coins: inc },
        {
          onSuccess: () => setInc(undefined),
        },
      )
    }
  }

  return (
    <Field orientation="horizontal">
      <NumberInput
        className="w-24"
        value={inc ?? ''}
        onChange={(v) => setInc(v === '' ? undefined : v)}
        disabled={mutation.isPending}
      />
      <Button size="icon" onClick={handleAddCoins} disabled={mutation.isPending || !inc}>
        {mutation.isPending ? <Loader className="animate-spin" /> : <Plus />}
      </Button>
    </Field>
  )
}
