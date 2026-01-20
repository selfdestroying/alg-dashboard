'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TeachersSection() {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">Преподаватели</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2"></CardContent>
    </Card>
  )
}
