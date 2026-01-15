import { Card, CardContent, CardHeader } from "@/components/ui/card"

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted ${className}`}
    />
  )
}

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      {/* Stats Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="shadow-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-10 rounded-lg" />
              </div>
              <div className="mt-4 space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Properties Skeleton */}
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-8 w-20" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
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
                <div className="text-right space-y-2">
                  <Skeleton className="h-4 w-24 ml-auto" />
                  <Skeleton className="h-5 w-20 ml-auto rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="shadow-card h-full">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <Skeleton className="h-11 w-11 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-44" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

