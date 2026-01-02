'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, AlertTriangle, Info, CheckCircle } from "lucide-react"
import { useFetch } from "@/hooks/useFetch"
import { apiClient } from "@/lib/api-client"
import { Alert as AlertType } from "@repo/shared-types"
import { Badge } from "@/components/ui/badge"

const severityMap = {
  critical: { icon: AlertCircle, color: "bg-red-500", label: "Critical" },
  high: { icon: AlertTriangle, color: "bg-orange-500", label: "High" },
  medium: { icon: Info, color: "bg-yellow-500", label: "Medium" },
  low: { icon: Info, color: "bg-blue-500", label: "Low" }
}

export function AlertsWidget() {
  const { data: alerts, loading, error } = useFetch<AlertType[]>(
    async () => await apiClient.getAlerts(),
    []
  )

  if (loading) return <div>Loading alerts...</div>
  if (!alerts?.length) return null

  // Filter only unresolved alerts and sort by severity (critical first)
  const activeAlerts = alerts
    .filter(a => !a.resolved)
    .sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      return severityOrder[a.severity] - severityOrder[b.severity]
    })
    .slice(0, 5) // Top 5 critical alerts

  if (activeAlerts.length === 0) return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
        <CheckCircle className="h-4 w-4 text-green-500" />
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground mt-2">
            No active critical alerts. System is healthy.
        </div>
      </CardContent>
    </Card>
  )

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Critical Actions Required</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activeAlerts.map((alert) => {
            const Config = severityMap[alert.severity] || severityMap.low
            const Icon = Config.icon
            
            return (
              <div key={alert.id} className="flex items-start gap-4 p-3 rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className={`p-2 rounded-full bg-opacity-10 ${Config.color.replace('bg-', 'text-')}`}>
                  <Icon className={`h-4 w-4 ${Config.color.replace('bg-', 'text-')}`} />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-none">
                      {alert.type.replace(/_/g, ' ').toUpperCase()}
                    </p>
                    <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'} className="text-xs">
                        {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {alert.message}
                  </p>
                  <p className="text-xs text-muted-foreground pt-1">
                    Customer ID: {alert.customerId} • {new Date(alert.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
