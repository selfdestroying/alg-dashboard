import { ModeToggle } from '@/components/mode-toggle'
import { Badge } from '@/components/ui/badge'
import { AttendanceStatusSwitcher } from './attendance-status-switcher'

export default function Page() {
  return (
    <div>
      <ModeToggle />
      <div className="flex items-center justify-center">
        <AttendanceStatusSwitcher />
      </div>
      <div className="mt-10 flex flex-wrap gap-2">
        <Badge>Default Badge</Badge>
        <Badge variant="secondary">Secondary Badge</Badge>
        <Badge variant="destructive">Destructive Badge</Badge>
        <Badge variant="outline">Outline Badge</Badge>
        <Badge variant="info">Information</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="error">Error</Badge>
        <Badge variant="warning">Warning</Badge>
      </div>
    </div>
  )
}
