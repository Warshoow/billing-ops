'use client'
import { useEffect, useState } from 'react'
import { Subscription } from '@repo/shared-types'
import { SubscriptionsTable } from '@/components/subscriptions-table'
import { useFetch } from '@/hooks/useFetch'
import { apiClient } from '@/lib/api-client'
import { Card } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function SubscriptionsPage() {
  const { data, loading, error, refetch } = useFetch<Subscription[]>(
    async () => await apiClient.fetchSubscriptions(),
    []
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-destructive">Error loading subscriptions: {error.message}</p>
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
        <SubscriptionsTable data={data || []} onUpdate={refetch} />
      </Card>
    </div>
  )
}
