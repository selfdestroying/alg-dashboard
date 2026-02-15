import { Prisma } from '@/prisma/generated/client'
import { Label } from '@/src/components/ui/label'
import { Separator } from '@/src/components/ui/separator'
import { auth } from '@/src/lib/auth'
import { getGroupName } from '@/src/lib/utils'
import { StudentWithGroupsAndAttendance } from '@/src/types/student'
import { Link as LinkIcon, Lock, LucideProps, ReceiptRussianRuble, User, Users } from 'lucide-react'
import { headers } from 'next/headers'
import Link from 'next/link'
import { ForwardRefExoticComponent, RefAttributes } from 'react'
import AddStudentToGroupButton from '../../../groups/[id]/_components/add-student-to-group-button'
import { GroupAttendanceTable } from '../../../groups/[id]/_components/group-attendance-table'
import AddCoinsForm from './add-coins-form'

interface StudentCardProps {
  student: StudentWithGroupsAndAttendance
  groups: Prisma.GroupGetPayload<{
    include: {
      location: true
      course: true
      students: true
      teachers: { include: { teacher: true } }
    }
  }>[]
}

export default async function StudentCard({ student, groups }: StudentCardProps) {
  const { success: canCreateStudentGroup } = await auth.api.hasPermission({
    headers: await headers(),
    body: {
      permission: { studentGroup: ['create'] },
    },
  })
  return (
    <>
      <Section title="Общие сведения" icon={User}>
        <div>
          <div className="text-muted-foreground flex items-center gap-2">
            <Label>Возраст</Label>
          </div>
          <p className="mt-1 font-medium">{student.age ?? 'Не указан'}</p>
        </div>
      </Section>

      <Separator />

      <Section title="Оплаты" icon={ReceiptRussianRuble}>
        <div>
          <div className="text-muted-foreground flex items-center gap-2">
            <Label>Сумма всех оплат</Label>
          </div>
          <p className="mt-1 font-medium">{student.totalPayments ?? 'Не указан'}</p>
        </div>
        <div>
          <div className="text-muted-foreground flex items-center gap-2">
            <Label>Всего уроков</Label>
          </div>
          <p className="mt-1 font-medium">{student.totalLessons ?? 'Не указан'}</p>
        </div>

        <div>
          <div className="text-muted-foreground flex items-center gap-2">
            <Label>Средняя стоимость урока</Label>
          </div>
          <p className="mt-1 font-medium">
            {(student.totalPayments / student.totalLessons).toFixed(2)}
          </p>
        </div>

        <div>
          <div className="text-muted-foreground flex items-center gap-2">
            <Label>Баланс уроков</Label>
          </div>
          <p className="mt-1 font-medium">{student.lessonsBalance}</p>
        </div>
      </Section>

      <Separator />

      <Section title="Учётная запись" icon={Lock}>
        <div>
          <div className="text-muted-foreground flex items-center gap-2">
            <Label>Логин</Label>
          </div>
          <p className="mt-1 font-medium">{student.login}</p>
        </div>

        <div>
          <div className="text-muted-foreground flex items-center gap-2">
            <Label>Пароль</Label>
          </div>
          <p className="mt-1 font-medium">{student.password}</p>
        </div>

        <div>
          <div className="text-muted-foreground flex items-center gap-2">
            <Label>Астрокоины</Label>
          </div>
          <div className="flex gap-2">
            <p className="mt-1 font-medium">{student.coins ?? 'Не указан'}</p>
            <AddCoinsForm studentId={student.id} />
          </div>
        </div>
      </Section>

      <Separator />

      <Section title="Родители" icon={User}>
        <div>
          <div className="text-muted-foreground flex items-center gap-2">
            <Label>ФИО Родителя</Label>
          </div>
          <p className="mt-1 font-medium">{student.parentsName ?? 'Не указано'}</p>
        </div>
      </Section>

      <Separator />

      <Section title="Ссылки и интеграции" icon={LinkIcon}>
        <div>
          <div className="text-muted-foreground flex items-center gap-2">
            <Label>Ссылка в CRM</Label>
          </div>
          <p className="mt-1 font-medium">
            {student.url ? (
              <a
                href={student.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Ссылка
              </a>
            ) : (
              'Не указано'
            )}
          </p>
        </div>
      </Section>

      <Separator />

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <h3 className="text-muted-foreground flex items-center gap-2 text-lg font-semibold">
            <Users size={20} />
            Группы
          </h3>
          {canCreateStudentGroup && <AddStudentToGroupButton groups={groups} student={student} />}
        </div>
        {student.groups.length > 0 ? (
          <div className="space-y-6">
            {student.groups.map((groupData) => (
              <div key={groupData.group.id} className="space-y-2">
                <Link
                  href={`/dashboard/groups/${groupData.group.id}`}
                  className="text-primary hover:underline"
                >
                  {getGroupName(groupData.group)}
                </Link>
                <GroupAttendanceTable lessons={groupData.group.lessons} data={[student]} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Ученик не состоит в группах.</p>
        )}
      </div>
    </>
  )
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>
  children: React.ReactNode
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-muted-foreground flex items-center gap-2 text-lg font-semibold">
        <Icon size={20} />
        {title}
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">{children}</div>
    </div>
  )
}
