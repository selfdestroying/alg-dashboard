import { getStudent } from '@/actions/students'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Calendar, Coins, Users } from 'lucide-react'
import Link from 'next/link'

interface StudentData {
  name: string
  age: string
  coinsBalance: string
  groups: string[]
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id
  const student = await getStudent(+id)
  if (!student) {
    return <div>Ошибка при получении ученика</div>
  }
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Avatar className="size-8">
            <AvatarFallback>
              {student.firstName.slice(0, 1).toUpperCase() +
                student.lastName?.slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle>
              {student.firstName} {student.lastName}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="grid gap-2 md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-muted-foreground flex items-center gap-2">
              <Calendar size={16} />
              <Label className="text-muted-foreground">Возраст</Label>
            </div>
            <p>{student.age} лет</p>
          </div>

          <div className="space-y-2">
            <div className="text-muted-foreground flex items-center gap-2">
              <Coins size={16} />
              <Label className="text-muted-foreground">Астрокоины</Label>
            </div>
            <p>{student.coins}</p>
          </div>
        </div>

        <Separator />

        {/* Groups Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users size={16} />
            <Label>Группы</Label>
          </div>

          <div className="flex flex-wrap gap-2">
            {student.groups.map((group) => (
              <div key={group.id} className="flex items-center">
                <Button
                  variant={'link'}
                  asChild
                  className="hover:border-primary/90 flex items-center justify-center gap-2 rounded-lg border p-2 decoration-0 transition-colors hover:no-underline"
                >
                  <Link href={`/dashboard/groups/${group.id}`} className="hover:decoration-0">
                    {group.name}
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
