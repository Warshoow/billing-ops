'use client'
import StatsCard from "@/components/stats-card";
import { useEffect, useState } from "react";
import { DashboardMetrics, Payment } from "@repo/shared-types";
import { BanknoteX, CircleDollarSign, RefreshCw, UserRoundMinus, Users } from "lucide-react";
import { ChartAreaInteractive } from "@/components/graph-card";
import { DataTableDemo } from "@/components/data-table";
import { useFetch } from "@/hooks/useFetch";
import { apiClient } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { AlertsWidget } from "@/components/alerts-widget";
import { Button } from "@/components/ui/button";

export default function Home() {
    const { data: metrics, loading: metricsLoading, error: metricsError, refetch: refetchMetrics } = useFetch<DashboardMetrics>(
        async () => await apiClient.getMetrics(),
        []
    );

    const [refreshKey, setRefreshKey] = useState(0);

    const { data: paymentsData, loading: paymentsLoading, error: paymentsError } = useFetch<any>(async () => {
        return await apiClient.get('/payments?status=failed');
    }, [refreshKey]);

    const [payments, setPayments] = useState<Payment[]>([]);

    useEffect(() => {
        if (paymentsData) {
            // Handle both paginated response and raw array
            const items = Array.isArray(paymentsData) ? paymentsData : paymentsData.data ?? [];
            setPayments(items);
        }
    }, [paymentsData]);

    if (metricsError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <p className="text-destructive text-lg">Failed to load dashboard metrics</p>
                <p className="text-muted-foreground text-sm">{metricsError.message}</p>
                <Button variant="outline" onClick={refetchMetrics}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                </Button>
            </div>
        );
    }

    if (metricsLoading || !metrics) return <div className="p-10 text-muted-foreground">Loading metrics...</div>;

    const stats = {
        mrr: {
            icon: <CircleDollarSign/>,
            label: 'Monthly Recurring Revenue (Dollars $)'
        },
        activeSubscriptions: {
            icon: <Users/>,
            label: 'Active Subscriptions'
        },
        failedPaymentsCount: {
            icon: <BanknoteX/>,
            label: 'Failed Payments'
        },
        churnRate: {
            icon: <UserRoundMinus/>,
            label: 'Churn Rate (%)'
        },
    }

    return (
        <>
            <div className="flex md:flex-row flex-col gap-4 w-full">
                {(Object.keys(stats) as Array<keyof typeof stats>).map((key) => {
                     const value = metrics[key as keyof DashboardMetrics] || 0;
                     return <StatsCard key={key} metric={{key: key, value: String(Number(value).toFixed(2)), info: stats[key]}} />
                })}
            </div>

            <AlertsWidget />

            <ChartAreaInteractive data={metrics.revenueHistory || []}/>

            {paymentsError ? (
                <Card className="p-6">
                    <div className="flex flex-col items-center justify-center py-8 gap-2">
                        <p className="text-destructive">Failed to load payments</p>
                        <Button variant="outline" size="sm" onClick={() => setRefreshKey(prev => prev + 1)}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Retry
                        </Button>
                    </div>
                </Card>
            ) : (
                <Card className="p-6">
                    <DataTableDemo data={payments} onUpdate={() => setRefreshKey(prev => prev + 1)}/>
                </Card>
            )}
        </>
    )
}
