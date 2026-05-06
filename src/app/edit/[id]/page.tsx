import PublicEditClient from '@/src/features/public-edit/components/public-edit-client'
import { TokenSchema } from '@/src/features/public-edit/schemas'
import prisma from '@/src/lib/db/prisma'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const metadata: Metadata = { title: 'Проверка данных' }

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params
  const token = TokenSchema.safeParse(id)

  if (!token.success) {
    return notFound()
  }

  const student = await prisma.student.findUnique({
    where: { editToken: token.data },
    select: {
      editToken: true,
      firstName: true,
      lastName: true,
      age: true,
      birthDate: true,
      dataActual: true,
      dataActualizedAt: true,
      organization: { select: { name: true } },
      parents: {
        include: {
          parent: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!student) {
    return notFound()
  }

  return (
    <PublicEditClient
      token={student.editToken}
      organizationName={student.organization.name}
      initialStudent={{
        firstName: student.firstName,
        lastName: student.lastName,
        age: student.age,
        birthDate: student.birthDate ? student.birthDate.toISOString().slice(0, 10) : null,
        dataActual: student.dataActual,
        dataActualizedAt: student.dataActualizedAt?.toISOString() ?? null,
      }}
      initialParents={student.parents.map(({ parent }) => parent)}
    />
  )
}
