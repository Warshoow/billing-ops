'use client'

import { useFetch } from "@/hooks/useFetch"
import { apiClient } from "@/lib/api-client"
import { Customer } from "@repo/shared-types"
import { CustomersTable } from "@/components/customers-table"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export default function CustomersPage() {
  const { data, loading, error, refetch } = useFetch<any>(
    async () => await apiClient.fetchCustomers(),
    []
  )

  // Handle both paginated response and raw array
  const customers: Customer[] = data
    ? (Array.isArray(data) ? data : data.data ?? [])
    : []

  if (loading) return <div className="p-10 text-muted-foreground">Loading customers...</div>

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-destructive">Failed to load customers</p>
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
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground">
          View customer status and lifetime value.
        </p>
      </div>
      <Card className="p-6">
        <CustomersTable data={customers} />
      </Card>
    </div>
  )
}
