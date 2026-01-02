"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Customer } from "@repo/shared-types"
import { Badge } from "@/components/ui/badge"

interface CustomersTableProps {
  data: Customer[]
}

const statusMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  "active": "default",
  "churned": "destructive",
  "at_risk": "secondary",
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function CustomersTable({ data }: CustomersTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>External User ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Lifetime Value</TableHead>
            <TableHead className="text-right">Joined</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No customers found.
              </TableCell>
            </TableRow>
          ) : (
            data.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.email}</TableCell>
                <TableCell>{customer.externalUserId}</TableCell>
                <TableCell>
                  <Badge variant={statusMap[customer.status] || "outline"} className="capitalize">
                    {customer.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-bold text-green-600">
                  {formatCurrency(customer.lifetimeValue)}
                </TableCell>
                <TableCell className="text-right">
                    {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
