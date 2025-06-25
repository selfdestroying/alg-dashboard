import { Card } from '@/components/ui/card'
import { Users } from 'lucide-react'

export default async function Page() {
  return (
    <Card className="h-96 flex items-center justify-center">
      <div className="text-center">
        <Users className="h-12 w-12 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Select a Group</h3>
        <p className="text-muted-foreground">
          Choose a group from the list to view students, schedules, and manage attendance.
        </p>
      </div>
    </Card>
  )
}
