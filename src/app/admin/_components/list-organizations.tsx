'use client'
import { Button } from '@/src/components/ui/button'
import { useSignOutMutation } from '@/src/data/user/sign-out-mutation'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Prisma } from '../../../../prisma/generated/client'
import CreateOrganizationDialog from './create-organization-dialog'
import ListMembers from './list-members'

interface ListOrganizationsProps {
  organizations: Prisma.OrganizationGetPayload<{
    include: {
      members: {
        include: { user: true }
      }
    }
  }>[]
  users: Prisma.UserGetPayload<{
    select: {
      id: true
      name: true
      email: true
    }
  }>[]
}

export default function ListOrganizations({ organizations }: ListOrganizationsProps) {
  const signOutMutation = useSignOutMutation()
  const router = useRouter()
  return (
    <div>
      <div className="flex items-center justify-between">
        <CreateOrganizationDialog />
        <Button
          size={'icon'}
          onClick={() => signOutMutation.mutate(undefined, { onSuccess: () => router.push('/') })}
        >
          <LogOut />
        </Button>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4">
        {organizations.map((org) => (
          <div key={org.id} className="bg-card rounded-lg border p-4">
            <h2 className="text-lg font-semibold">
              {org.name} - <span className="text-muted-foreground text-sm">{org.slug}</span>
            </h2>
            <ListMembers members={org.members} organizationId={org.id} />
          </div>
        ))}
      </div>
    </div>
  )
}
