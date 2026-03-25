'use client'
import { Subscription } from '@repo/shared-types'
import { SubscriptionsTable } from '@/components/subscriptions-table'
import { useFetch } from '@/hooks/useFetch'
import { apiClient } from '@/lib/api-client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw } from 'lucide-react'

export default function SubscriptionsPage() {
  const { data, loading, error, refetch } = useFetch<any>(
    async () => await apiClient.fetchSubscriptions(),
    []
  )

  // Handle both paginated response and raw array
  const subscriptions: Subscription[] = data
    ? (Array.isArray(data) ? data : data.data ?? [])
    : []

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-destructive">Failed to load subscriptions</p>
        <p className="text-muted-foreground text-sm">{error.message}</p>
        <Button variant="outline" onClick={refetch}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
        <p className="text-muted-foreground">
          Manage customer subscriptions
        </p>
      </div>

      <Card className="p-6">
        <SubscriptionsTable data={subscriptions} onUpdate={refetch} />
      </Card>
    </div>
  )
}
