'use client'

import { Logo } from '@/src/components/logo'
import { Button } from '@/src/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/src/components/ui/dialog'
import { Input } from '@/src/components/ui/input'
import { getFullName } from '@/src/lib/utils'
import { Check, Loader } from 'lucide-react'
import { FormEvent, useState } from 'react'
import {
  useConfirmPublicActualityMutation,
  useCreatePublicParentMutation,
  useUpdatePublicParentMutation,
  useUpdatePublicStudentMutation,
} from '../queries'
import type { PublicParent, PublicStudentUpdate } from '../types'

type StudentState = PublicStudentUpdate

type NewParentState = {
  firstName: string
  lastName: string
  phone: string
  email: string
}

const emptyParent: NewParentState = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
}

export type PublicEditClientProps = {
  token: string
  organizationName: string
  initialStudent: StudentState
  initialParents: PublicParent[]
}

export default function PublicEditClient({
  token,
  organizationName,
  initialStudent,
  initialParents,
}: PublicEditClientProps) {
  const [student, setStudent] = useState(initialStudent)
  const [parents, setParents] = useState(initialParents)
  const [newParent, setNewParent] = useState<NewParentState>(emptyParent)
  const [addParentOpen, setAddParentOpen] = useState(false)

  const updateStudentMutation = useUpdatePublicStudentMutation()
  const updateParentMutation = useUpdatePublicParentMutation()
  const createParentMutation = useCreatePublicParentMutation()
  const confirmActualityMutation = useConfirmPublicActualityMutation()

  const submitStudent = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    updateStudentMutation.mutate(
      {
        token,
        firstName: String(form.get('studentFirstName') ?? ''),
        lastName: String(form.get('studentLastName') ?? ''),
        birthDate: String(form.get('studentBirthDate') ?? ''),
      },
      {
        onSuccess: (data) => {
          if (data) setStudent(data)
        },
      },
    )
  }

  const updateParentField = (
    parentId: number,
    field: keyof Pick<PublicParent, 'firstName' | 'lastName' | 'phone' | 'email'>,
    value: string,
  ) => {
    setParents((current) =>
      current.map((parent) => (parent.id === parentId ? { ...parent, [field]: value } : parent)),
    )
  }

  const submitParent = (event: FormEvent<HTMLFormElement>, parentId: number) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    updateParentMutation.mutate(
      {
        token,
        parentId,
        firstName: String(form.get('parentFirstName') ?? ''),
        lastName: String(form.get('parentLastName') ?? ''),
        phone: String(form.get('parentPhone') ?? ''),
        email: String(form.get('parentEmail') ?? ''),
      },
      {
        onSuccess: (data) => {
          if (data) {
            setParents((current) =>
              current.map((parent) => (parent.id === parentId ? data : parent)),
            )
            setStudent((current) => ({ ...current, dataActual: false, dataActualizedAt: null }))
          }
        },
      },
    )
  }

  const submitNewParent = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    createParentMutation.mutate(
      { token, ...newParent },
      {
        onSuccess: (data) => {
          if (data) {
            setParents((current) => [...current, data])
            setStudent((current) => ({ ...current, dataActual: false, dataActualizedAt: null }))
            setNewParent(emptyParent)
            setAddParentOpen(false)
          }
        },
      },
    )
  }

  const confirmActuality = () => {
    confirmActualityMutation.mutate(
      { token },
      {
        onSuccess: (data) => {
          if (data) {
            setStudent((current) => ({
              ...current,
              dataActual: data.dataActual,
              dataActualizedAt: data.dataActualizedAt,
            }))
          }
        },
      },
    )
  }

  return (
    <main className="relative flex min-h-screen justify-center overflow-hidden px-4 py-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="animate-landing-float bg-primary/10 absolute -top-32 -right-32 h-96 w-96 rounded-full blur-3xl" />
        <div className="animate-landing-float-delayed bg-primary/8 absolute -bottom-40 -left-40 h-120 w-120 rounded-full blur-3xl" />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[4rem_4rem] opacity-30" />

      <div className="relative z-10 flex w-full max-w-2xl flex-col gap-4">
        <header className="flex flex-col items-center gap-3 text-center">
          <div className="ring-border/60 bg-card/80 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl shadow-xl ring-1 shadow-black/5 backdrop-blur-xl dark:shadow-black/20">
            <Logo className="text-primary size-14" />
          </div>
          <div className="space-y-2">
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              {organizationName}
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">Проверка данных</h1>
            <p className="text-muted-foreground text-sm">Проверьте информацию о себе и ребёнке.</p>
            <p className="text-muted-foreground text-center text-xs">
              Ссылка уникальна для этой анкеты. Не пересылайте её посторонним.
            </p>
          </div>
        </header>

        <Card className="bg-card/80 shadow-xl shadow-black/5 backdrop-blur-xl dark:shadow-black/20">
          <CardHeader>
            <CardTitle>Актуальность данных</CardTitle>
            <CardDescription>
              {student.dataActual && student.dataActualizedAt
                ? `Данные подтверждены ${formatActualizedAt(student.dataActualizedAt)}.`
                : 'После проверки анкеты подтвердите, что данные актуальны.'}
            </CardDescription>
            <CardAction>
              <Button
                type="button"
                disabled={confirmActualityMutation.isPending}
                onClick={confirmActuality}
                className="bg-success/10 text-success hover:bg-success/20"
              >
                {confirmActualityMutation.isPending ? (
                  <Loader className="animate-spin" />
                ) : (
                  <Check />
                )}
                <span>Подтвердить</span>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-xs">
              {student.dataActual ? (
                'Менеджер увидит дату последнего подтверждения.'
              ) : (
                <span>
                  Если всё верно, нажмите <strong>Подтвердить</strong>. Если вы изменили данные,
                  сначала сохраните формы.
                </span>
              )}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card/80 shadow-xl shadow-black/5 backdrop-blur-xl dark:shadow-black/20">
          <CardHeader>
            <CardTitle>Данные ребёнка</CardTitle>
            <CardDescription>Минимальная информация, которая хранится в школе.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitStudent} className="grid gap-4 sm:grid-cols-2">
              <TextField
                id="studentFirstName"
                name="studentFirstName"
                label="Имя ребёнка"
                value={student.firstName}
                onChange={(event) =>
                  setStudent((current) => ({ ...current, firstName: event.target.value }))
                }
                required
              />
              <TextField
                id="studentLastName"
                name="studentLastName"
                label="Фамилия ребёнка"
                value={student.lastName}
                onChange={(event) =>
                  setStudent((current) => ({ ...current, lastName: event.target.value }))
                }
                required
              />
              <TextField
                id="studentBirthDate"
                name="studentBirthDate"
                label="Дата рождения"
                type="date"
                value={student.birthDate ?? ''}
                onChange={(event) =>
                  setStudent((current) => ({ ...current, birthDate: event.target.value || null }))
                }
                description={student.age ? `Возраст: ${student.age}` : 'Можно оставить пустым'}
              />

              <div className="sm:col-span-2">
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={updateStudentMutation.isPending}
                >
                  {updateStudentMutation.isPending && <Loader className="animate-spin" />}
                  Сохранить данные ребёнка
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <section className="border-border/80 bg-card/80 rounded-xl border p-3 shadow-xl shadow-black/5 backdrop-blur-xl sm:p-4 dark:shadow-black/20">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-medium">Родители</h2>
              <p className="text-muted-foreground text-xs">
                Контактные данные родителей и опекунов для связи со школой.
              </p>
            </div>
            <Dialog open={addParentOpen} onOpenChange={setAddParentOpen}>
              <DialogTrigger render={<Button className="w-full sm:w-auto" />}>
                Добавить родителя
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Добавить родителя</DialogTitle>
                  <DialogDescription>
                    {parents.length > 0
                      ? 'Если с ребёнком связан ещё один родитель или опекун, добавьте его контакты.'
                      : 'Родитель ещё не указан. Заполните данные, чтобы школа могла с вами связаться.'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={submitNewParent} id="create-parent-form" className="grid gap-4">
                  <TextField
                    id="new-parent-firstName"
                    name="parentFirstName"
                    label="Имя родителя"
                    value={newParent.firstName}
                    onChange={(event) =>
                      setNewParent((current) => ({ ...current, firstName: event.target.value }))
                    }
                    required
                  />
                  <TextField
                    id="new-parent-lastName"
                    name="parentLastName"
                    label="Фамилия"
                    value={newParent.lastName}
                    onChange={(event) =>
                      setNewParent((current) => ({ ...current, lastName: event.target.value }))
                    }
                  />
                  <TextField
                    id="new-parent-phone"
                    name="parentPhone"
                    label="Телефон"
                    type="tel"
                    placeholder="+7 999 000-00-00"
                    value={newParent.phone}
                    onChange={(event) =>
                      setNewParent((current) => ({ ...current, phone: event.target.value }))
                    }
                  />
                  <TextField
                    id="new-parent-email"
                    name="parentEmail"
                    label="Email"
                    type="email"
                    placeholder="name@example.com"
                    value={newParent.email}
                    onChange={(event) =>
                      setNewParent((current) => ({ ...current, email: event.target.value }))
                    }
                  />
                </form>
                <DialogFooter>
                  <DialogClose
                    render={<Button variant="outline" disabled={createParentMutation.isPending} />}
                  >
                    Отмена
                  </DialogClose>
                  <Button
                    type="submit"
                    form="create-parent-form"
                    disabled={createParentMutation.isPending}
                  >
                    {createParentMutation.isPending && <Loader className="animate-spin" />}
                    Добавить родителя
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex flex-col gap-4">
            {parents.length === 0 && (
              <p className="text-muted-foreground rounded-lg border border-dashed p-4 text-center text-xs">
                Родители ещё не указаны. Добавьте контактные данные родителя.
              </p>
            )}
            {parents.map((parent) => (
              <Card key={parent.id}>
                <CardHeader>
                  <CardTitle>Данные родителя</CardTitle>
                  <CardDescription>
                    {getFullName(parent.firstName, parent.lastName)} — контактная информация для
                    связи.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={(event) => submitParent(event, parent.id)}
                    className="grid gap-4 sm:grid-cols-2"
                  >
                    <TextField
                      id={`parent-${parent.id}-firstName`}
                      name="parentFirstName"
                      label="Имя родителя"
                      value={parent.firstName}
                      onChange={(event) =>
                        updateParentField(parent.id, 'firstName', event.target.value)
                      }
                      required
                    />
                    <TextField
                      id={`parent-${parent.id}-lastName`}
                      name="parentLastName"
                      label="Фамилия родителя"
                      value={parent.lastName ?? ''}
                      onChange={(event) =>
                        updateParentField(parent.id, 'lastName', event.target.value)
                      }
                    />
                    <TextField
                      id={`parent-${parent.id}-phone`}
                      name="parentPhone"
                      label="Телефон"
                      type="tel"
                      value={parent.phone ?? ''}
                      onChange={(event) =>
                        updateParentField(parent.id, 'phone', event.target.value)
                      }
                      placeholder="+7 999 000-00-00"
                    />
                    <TextField
                      id={`parent-${parent.id}-email`}
                      name="parentEmail"
                      label="Email"
                      type="email"
                      value={parent.email ?? ''}
                      onChange={(event) =>
                        updateParentField(parent.id, 'email', event.target.value)
                      }
                      placeholder="name@example.com"
                    />

                    <div className="sm:col-span-2">
                      <Button
                        type="submit"
                        className="w-full sm:w-auto"
                        disabled={updateParentMutation.isPending}
                      >
                        {updateParentMutation.isPending && <Loader className="animate-spin" />}
                        Сохранить данные родителя
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

function TextField({
  id,
  name,
  label,
  description,
  ...props
}: {
  id: string
  name: string
  label: string
  description?: string
} & React.ComponentProps<typeof Input>) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5 text-xs font-medium">
      {label}
      <Input id={id} name={name} {...props} />
      {description && <span className="text-muted-foreground font-normal">{description}</span>}
    </label>
  )
}

function formatActualizedAt(value: string) {
  return new Date(value).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Moscow',
  })
}
