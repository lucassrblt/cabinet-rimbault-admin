import { Card, CardContent, CardHeader } from "@/components/ui/card"

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />
}

export default function AuthenticatedLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border border-border p-4"
            >
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
