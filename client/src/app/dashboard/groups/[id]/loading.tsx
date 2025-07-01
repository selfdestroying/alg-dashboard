import { LoaderCircle } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <LoaderCircle className="animate-spin" />
    </div>
  )
}
