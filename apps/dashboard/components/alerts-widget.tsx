import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, AlertTriangle, Info, CheckCircle, Filter } from "lucide-react"
import { useFetch } from "@/hooks/useFetch"
import { apiClient } from "@/lib/api-client"
import { Alert as AlertType } from "@repo/shared-types"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"

const severityMap = {
  critical: { icon: AlertCircle, color: "bg-red-500", label: "Critical" },
  high: { icon: AlertTriangle, color: "bg-orange-500", label: "High" },
  medium: { icon: Info, color: "bg-yellow-500", label: "Medium" },
  low: { icon: Info, color: "bg-blue-500", label: "Low" }
}

export function AlertsWidget() {
  const [filterSeverity, setFilterSeverity] = useState<string | null>(null)
  
  const { data: alerts, loading, error, refetch } = useFetch<AlertType[]>(
    async () => await apiClient.getAlerts(),
    []
  )

  const activeAlerts = (alerts || [])
    .filter(a => !a.resolved)
    .filter(a => filterSeverity ? a.severity === filterSeverity : true)
    .sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      const diff = severityOrder[a.severity] - severityOrder[b.severity]
      if (diff !== 0) return diff
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
    .slice(0, 5)

  if (loading) return <div>Loading alerts...</div>

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Critical Actions Required</CardTitle>
        <div className="flex gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-4 p-0 px-2 text-xs">
                        <Filter className="h-3 w-3 mr-1" />
                        {filterSeverity ? filterSeverity : 'All'}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by Severity</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setFilterSeverity(null)}>
                        All
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterSeverity('critical')}>
                        Critical
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterSeverity('high')}>
                        High
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterSeverity('medium')}>
                        Medium
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterSeverity('low')}>
                        Low
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="sm" onClick={refetch} className="h-4 p-0 px-2 text-xs">
                Refresh
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        {activeAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-4 text-center text-muted-foreground">
                <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                <p>System is healthy.</p>
            </div>
        ) : (
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
        )}
      </CardContent>
    </Card>
  )
}
