import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-[340px]" />
        <Skeleton className="h-[340px]" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {["inc-1","inc-2","inc-3","inc-4","inc-5"].map(id => (
            <Skeleton key={id} className="h-16" />
          ))}
        </div>
        <div className="space-y-4">
          {["exp-1","exp-2","exp-3","exp-4","exp-5"].map(id => (
            <Skeleton key={id} className="h-16" />
          ))}
        </div>
      </div>
    </div>
  )
}
