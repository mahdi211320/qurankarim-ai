/**
 * بلوک اسکلت برای حالت لودینگ (جایگزین محتوای واقعی تا زمان دریافت داده).
 * @param {{ className?: string }} props
 */
export default function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-paper-soft rounded-lg ${className}`} />
}

export function LessonCardSkeleton() {
  return (
    <div className="card-surface p-4 flex items-center gap-3">
      <Skeleton className="w-11 h-11 rounded-full shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
  )
}
