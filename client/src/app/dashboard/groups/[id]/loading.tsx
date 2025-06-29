import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-4">
          <Skeleton className="h-8 w-[120px]" />
          <Skeleton className="h-6 w-96" />
        </div>
      </div>

      <Skeleton className="h-10 w-34" />
      <Skeleton className="h-52" />
    </div>
  )
}
