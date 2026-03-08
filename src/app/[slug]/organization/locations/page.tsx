import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import AddLocationButton from '@/src/features/locations/components/add-location-button'
import LocationsTable from '@/src/features/locations/components/locations-table'

export const metadata = { title: 'Локации' }

export default function Page() {
  return (
    <div className="grid min-h-0 flex-1 grid-cols-1">
      <Card>
        <CardHeader>
          <CardTitle>Локации</CardTitle>
          <CardDescription>Управление локациями организации</CardDescription>
          <CardAction>
            <AddLocationButton />
          </CardAction>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <LocationsTable />
        </CardContent>
      </Card>
    </div>
  )
}
