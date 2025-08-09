import { getStudent } from '@/actions/students'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Calendar, Coins, Link as LinkIcon, Lock, User, Users } from 'lucide-react'
import Link from 'next/link'

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = params
  const student = await getStudent(+id)

  if (!student) return <div>Ошибка при получении ученика</div>

  const sections = [
    {
      title: 'Общие сведения',
      icon: User,
      items: [{ icon: Calendar, label: 'Возраст', value: `${student.age} лет` }],
    },
    {
      title: 'Учётная запись',
      icon: Lock,
      items: [
        { icon: User, label: 'Логин', value: student.login },
        { icon: Lock, label: 'Пароль', value: student.password },
        { icon: Coins, label: 'Астрокоины', value: student.coins },
      ],
    },
    {
      title: 'Родители',
      icon: User,
      items: [{ icon: User, label: 'ФИО Родителя', value: student.parentsName }],
    },
    {
      title: 'Ссылки и интеграции',
      icon: LinkIcon,
      items: [
        {
          icon: LinkIcon,
          label: 'Ссылка в amoCRM',
          value: student.crmUrl ? (
            <Button variant="link" asChild size="sm" className="h-fit p-0">
              <a target="_blank" href={student.crmUrl} rel="noopener noreferrer">
                {student.crmUrl}
              </a>
            </Button>
          ) : (
            'Не указано'
          ),
        },
      ],
    },
  ]

  return (
    <Card className="">
      {/* Header */}
      <CardHeader className="flex items-center gap-4 border-b p-4">
        <Avatar className="size-12">
          <AvatarFallback className="bg-primary text-primary-foreground rounded-full text-xl font-bold">
            {student.firstName?.[0]?.toUpperCase()}
            {student.lastName?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <CardTitle className="text-2xl font-bold">
          {student.firstName} {student.lastName}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        {/* Student Info Sections */}
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-4">
            <h3 className="text-muted-foreground flex items-center gap-2 text-lg font-semibold">
              <section.icon size={20} />
              {section.title}
            </h3>
            <InfoGrid items={section.items} />
            {idx < sections.length - 1 && <Separator />}
          </div>
        ))}

        {/* Groups */}
        <div className="space-y-4">
          <h3 className="text-muted-foreground flex items-center gap-2 text-lg font-semibold">
            <Users size={20} />
            Группы
          </h3>
          {student.groups.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {student.groups.map((group) => (
                <Button
                  key={group.id}
                  variant="outline"
                  asChild
                  className="h-auto rounded-full px-4 py-1"
                >
                  <Link href={`/dashboard/groups/${group.id}`}>{group.name}</Link>
                </Button>
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

function InfoGrid({ items }: { items: { icon: any; label: string; value: React.ReactNode }[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item, idx) => (
        <InfoItem key={idx} icon={item.icon} label={item.label} value={item.value} />
      ))}
    </div>
  )
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: any
  label: string
  value: React.ReactNode
}) {
  return (
    <div>
      <div className="text-muted-foreground flex items-center gap-2">
        <Icon size={16} />
        <Label>{label}</Label>
      </div>
      <p className="mt-1 font-medium break-all">{value}</p>
    </div>
  )
}
