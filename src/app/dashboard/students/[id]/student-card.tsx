'use client'

import { getGroup } from '@/actions/groups'
import { StudentWithGroupsAndAttendance, updateStudentCard } from '@/actions/students'
import { StudentGroupDialog } from '@/components/student-group-dialog'
import { GroupaAttendanceTable } from '@/components/tables/group-attendance-table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Calendar,
  Coins,
  Link as LinkIcon,
  Lock,
  LucideProps,
  Presentation,
  ReceiptRussianRuble,
  RussianRuble,
  User,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { ForwardRefExoticComponent, RefAttributes, useState } from 'react'

interface StudentCardProps {
  student: StudentWithGroupsAndAttendance
}

export default function StudentCard({ student }: StudentCardProps) {
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState<StudentWithGroupsAndAttendance>(student)

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    await updateStudentCard(formData) // нужно реализовать в actions/students
    setEditMode(false)
  }

  return (
    <Card>
      {/* Header */}
      <CardHeader className="flex flex-col items-center justify-between gap-4 border-b p-4 sm:flex-row">
        <div className="flex items-center gap-4">
          <Avatar className="size-12">
            <AvatarFallback className="bg-primary text-primary-foreground rounded-full text-xl font-bold">
              {student.firstName?.[0]?.toUpperCase()}
              {student.lastName?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl font-bold">
            <div className="flex gap-2">
              <EditableInfoItem
                field="firstName"
                value={formData.firstName}
                editable={editMode}
                onChange={handleChange}
              />
              <EditableInfoItem
                field="lastName"
                value={formData.lastName ?? ''}
                editable={editMode}
                onChange={handleChange}
              />
            </div>
            {/* {formData.firstName} {formData.lastName} */}
          </CardTitle>
        </div>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <Button onClick={handleSave}>Сохранить</Button>
              <Button variant="outline" onClick={() => setEditMode(false)}>
                Отмена
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditMode(true)}>Редактировать</Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        {/* Общие сведения */}
        <Section title="Общие сведения" icon={User}>
          <EditableInfoItem
            icon={Calendar}
            label="Возраст"
            field="age"
            value={formData.age}
            editable={editMode}
            onChange={handleChange}
          />
        </Section>

        <Separator />

        <Section title="Оплаты" icon={ReceiptRussianRuble}>
          <EditableInfoItem
            icon={RussianRuble}
            label="Сумма всех оплат"
            field="totalPayments"
            value={formData.totalPayments}
            editable={editMode}
            onChange={handleChange}
          />
          <EditableInfoItem
            icon={Presentation}
            label="Сумма всех уроков"
            field="totalLessons"
            value={formData.totalLessons}
            editable={editMode}
            onChange={handleChange}
          />
          <EditableInfoItem
            icon={RussianRuble}
            label="Ставка за урок"
            field=""
            value={formData.totalPayments / formData.totalLessons}
            editable={false}
            onChange={handleChange}
          />

          <EditableInfoItem
            icon={Presentation}
            label="Баланс уроков"
            field="lessonsBalance"
            value={formData.lessonsBalance}
            editable={editMode}
            onChange={handleChange}
          />
        </Section>

        <Separator />

        {/* Учётная запись */}
        <Section title="Учётная запись" icon={Lock}>
          <EditableInfoItem
            icon={User}
            label="Логин"
            field="login"
            value={formData.login}
            editable={editMode}
            onChange={handleChange}
          />
          <EditableInfoItem
            icon={Lock}
            label="Пароль"
            field="password"
            value={formData.password}
            editable={editMode}
            onChange={handleChange}
          />
          <EditableInfoItem
            icon={Coins}
            label="Астрокоины"
            field="coins"
            value={formData.coins.toString()}
            editable={editMode}
            onChange={handleChange}
          />
        </Section>

        <Separator />

        {/* Родители */}
        <Section title="Родители" icon={User}>
          <EditableInfoItem
            icon={User}
            label="ФИО Родителя"
            field="parentsName"
            value={formData.parentsName ?? ''}
            editable={editMode}
            onChange={handleChange}
          />
        </Section>

        <Separator />

        {/* Ссылки */}
        <Section title="Ссылки и интеграции" icon={LinkIcon}>
          <EditableInfoItem
            icon={LinkIcon}
            label="Ссылка в amoCRM"
            field="crmUrl"
            value={formData.crmUrl ?? ''}
            editable={editMode}
            onChange={handleChange}
            isLink
          />
        </Section>

        <Separator />

        {/* Groups */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <h3 className="text-muted-foreground flex items-center gap-2 text-lg font-semibold">
              <Users size={20} />
              Группы
            </h3>
            <StudentGroupDialog studentId={student.id} />
          </div>
          {student.groups.length > 0 ? (
            <div className="space-y-6">
              {student.groups.map((groupData) => (
                <div key={groupData.group.id} className="space-y-2">
                  <Link
                    href={`/dashboard/groups/${groupData.group.id}`}
                    className="text-primary hover:underline"
                  >
                    {groupData.group.name}
                  </Link>
                  <GroupaAttendanceTable
                    data={groupData.group as Awaited<ReturnType<typeof getGroup>>}
                    lessons={groupData.group.lessons}
                    students={[student]}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Ученик не состоит в группах.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/* ----------- Вспомогательные компоненты ----------- */
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

function EditableInfoItem({
  icon: Icon,
  label,
  value,
  field,
  editable,
  onChange,
  isLink = false,
}: {
  icon?: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>
  label?: string
  value: string | number
  field: string
  editable: boolean
  onChange: (field: string, newValue: string) => void
  isLink?: boolean
}) {
  return (
    <div>
      {Icon && label && (
        <div className="text-muted-foreground flex items-center gap-2">
          <Icon size={16} />
          <Label>{label}</Label>
        </div>
      )}
      {editable ? (
        <Input
          className="mt-1"
          value={value ?? ''}
          onChange={(e) => onChange(field, e.target.value)}
        />
      ) : isLink && value ? (
        <a
          target="_blank"
          href={value as string}
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {value}
        </a>
      ) : (
        <p className="mt-1 font-medium break-all">
          {value !== null || value !== undefined ? value.toString() : 'Не указано'}
        </p>
      )}
    </div>
  )
}
