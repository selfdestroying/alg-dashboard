'use client'

import { StatCard } from '@/src/components/stat-card'
import { Separator } from '@/src/components/ui/separator'
import { Cake, ExternalLink, Link as LinkIcon, LucideIcon, User, UserRound } from 'lucide-react'
import type { StudentDetail } from '../../types'

interface StudentCardProps {
  student: StudentDetail
}

export default function StudentCard({ student }: StudentCardProps) {
  const birthFormatted = student.birthDate
    ? new Date(student.birthDate).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  const memberSince = new Date(student.createdAt).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <>
      {/* Общие сведения */}
      <SectionHeader title="Общие сведения" icon={User} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Возраст"
          value={student.age ? `${student.age} лет` : 'Не указан'}
          icon={UserRound}
        />
        <StatCard label="Дата рождения" value={birthFormatted ?? 'Не указана'} icon={Cake} />
        <StatCard
          label="В системе с"
          value={memberSince}
          description={`Групп: ${student.groups.length}`}
        />
      </div>

      <Separator />

      {/* Ссылки и интеграции */}
      {student.url && (
        <>
          <SectionHeader title="Ссылки и интеграции" icon={LinkIcon} />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label="Ссылка в CRM"
              value={
                student.url ? (
                  <a
                    href={student.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary inline-flex items-center gap-1 hover:underline"
                  >
                    Открыть
                    <ExternalLink className="size-3" />
                  </a>
                ) : (
                  'Не указано'
                )
              }
              icon={ExternalLink}
            />
          </div>
          <Separator />
        </>
      )}
    </>
  )
}

function SectionHeader({ title, icon: Icon }: { title: string; icon: LucideIcon }) {
  return (
    <h3 className="text-muted-foreground flex items-center gap-2 text-lg font-semibold">
      <Icon size={20} />
      {title}
    </h3>
  )
}
