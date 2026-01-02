'use client'

import { useFetch } from "@/hooks/useFetch"
import { apiClient } from "@/lib/api-client"
import { Customer } from "@repo/shared-types"
import { CustomersTable } from "@/components/customers-table"
import { Card } from "@/components/ui/card"

export default function CustomersPage() {
  const { data: customers, loading, error } = useFetch<Customer[]>(
    async () => await apiClient.fetchCustomers(),
    []
  )

  if (loading) return <div className="p-10">Loading customers...</div>
  if (error) return <div className="p-10 text-red-500">Error: {error.message}</div>

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground">
          View customer status and lifetime value.
        </p>
      </div>
      <Card className="p-6">
        <CustomersTable data={customers || []} />
      </Card>
    </div>
  )
}
