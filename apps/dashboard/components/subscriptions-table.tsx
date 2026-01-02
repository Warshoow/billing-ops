'use client'
import { useState } from "react"
import { Subscription } from "@repo/shared-types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api-client"
import { XCircle, Loader2 } from "lucide-react"

interface SubscriptionsTableProps {
  data: Subscription[]
  onUpdate?: () => void
}

export function SubscriptionsTable({ data, onUpdate }: SubscriptionsTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleCancel = async (subscription: Subscription) => {
    if (!confirm(`Are you sure you want to cancel this subscription?`)) return

    try {
      setLoadingId(subscription.id)
      await apiClient.cancelSubscription(subscription.id)
      alert('Subscription cancelled successfully!')
      onUpdate?.()
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setLoadingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount)
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer ID</TableHead>
            <TableHead>Plan Amount</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Current Period End</TableHead>
            <TableHead>Cancel at Period End</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No subscriptions found
              </TableCell>
            </TableRow>
          ) : (
            data.map((subscription) => (
              <TableRow key={subscription.id}>
                <TableCell className="font-medium">
                  Customer ID: {subscription.customerId}
                </TableCell>
                <TableCell>
                  {subscription.planAmount ? `${subscription.currency.toUpperCase()} ${subscription.planAmount}` : 'N/A'}
                </TableCell>
                <TableCell>
                  {formatAmount(subscription.planAmount, subscription.currency)}
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                    subscription.status === 'canceled' ? 'bg-red-100 text-red-800' :
                    subscription.status === 'past_due' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {subscription.status}
                  </span>
                </TableCell>
                <TableCell>{formatDate(subscription.currentPeriodEnd)}</TableCell>
                <TableCell>
                  {subscription.cancelAtPeriodEnd ? 'Yes' : 'No'}
                </TableCell>
                <TableCell className="text-right">
                  {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCancel(subscription)}
                      disabled={loadingId === subscription.id}
                    >
                      {loadingId === subscription.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 mr-1" />
                          Cancel
                        </>
                      )}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
