'use client'

import { Badge } from '@/components/ui/badge'
import { IGroup } from '@/types/group'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'

export default function Groups({ groups }: { groups: IGroup[] }) {
  const pathname = usePathname()
  const selectedGroup = pathname.split('/')[pathname.split('/').length - 1]

  return (
    <div className="space-y-2">
      {groups.map((group) => (
        <div key={group.id} className="space-y-2">
          <Card
            className={`p-0 cursor-pointer hover:shadow-md ${+selectedGroup === group.id ? 'dark:border-blue-900 dark:bg-blue-950 border-blue-500 bg-blue-50' : 'dark:border-neutral-800 border-neutral-200'}`}
          >
            <CardContent className="p-0">
              <Link
                href={`/dashboard/groups/${group.id}`}
                className="flex items-center justify-between p-2"
              >
                <h3 className="font-semibold">{group.name}</h3>
                <Badge variant={'outline'}>{group.students.length} ученик(а/ов)</Badge>
              </Link>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  )
}
