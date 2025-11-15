'use client'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { DefaultValues, useForm } from 'react-hook-form'

import { createStudent } from '@/actions/students'
import { StudentSchema, StudentSchemaType } from '@/schemas/student'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { PaycheckSchema, PaycheckSchemaType } from '@/schemas/paycheck'
import { createPaycheck } from '@/actions/paycheck'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { CalendarIcon } from 'lucide-react'
import { Calendar } from '../ui/calendar'
import { ru } from 'date-fns/locale'
import { format } from 'date-fns'

interface PaycheckFormProps {
    userId: number
    onSubmit?: () => void
}

export default function PaycheckForm({ userId, onSubmit }: PaycheckFormProps) {
    const form = useForm<PaycheckSchemaType>({
        resolver: zodResolver(PaycheckSchema),
        defaultValues: {
            userId,
            comment: '',
            amount: 0
        },
    })

    function handleSubmit(values: PaycheckSchemaType) {
        const ok = createPaycheck({ data: values })
        toast.promise(ok, {
            loading: 'Загрузка...',
            success: 'Чек успешно добавлен',
            error: (e) => e.message,
        })
        onSubmit?.()
    }

    return (
        <Form {...form}>
            <form
                className="@container space-y-8"
                onSubmit={form.handleSubmit(handleSubmit)}
                id="paycheck-form"
            >
                <div className="grid grid-cols-12 gap-4">
                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem className="col-span-12 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
                                <FormLabel className="flex shrink-0">Сумма</FormLabel>
                                <FormControl>
                                    <div className="relative w-full">
                                        <Input

                                            className="peer ps-6 pe-12"
                                            placeholder="0"
                                            type="number"
                                            min={1}
                                            value={field.value ?? ''}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                        <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-sm text-muted-foreground peer-disabled:opacity-50">
                                            ₽
                                        </span>
                                        <span className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-sm text-muted-foreground peer-disabled:opacity-50">
                                            RUB
                                        </span>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="comment"
                        render={({ field }) => (
                            <FormItem className="col-span-12 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
                                <FormLabel className="flex shrink-0">Комментарий</FormLabel>

                                <FormControl>
                                    <Input placeholder="" type="text" {...field} />
                                </FormControl>

                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>
                                    Дата зачисления <span className="text-destructive">*</span>
                                </FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-left font-normal"
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {field.value ? format(field.value, 'dd.MM.yyyy') : 'Выбрать дату'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            locale={ru}
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                </div>
            </form>
        </Form>
    )
}
