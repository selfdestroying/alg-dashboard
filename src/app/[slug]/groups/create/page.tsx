import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import CreateGroupForm from '@/src/features/groups/components/create-group-form'

export const metadata = { title: 'Создать группу' }

export default function Page() {
  return (
    <div className="grid min-h-0 flex-1 grid-cols-1">
      <Card>
        <CardHeader>
          <CardTitle>Создать группу</CardTitle>
          <CardDescription>Заполните форму ниже, чтобы создать новую группу.</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateGroupForm />
        </CardContent>
      </Card>
    </div>
  )
}
