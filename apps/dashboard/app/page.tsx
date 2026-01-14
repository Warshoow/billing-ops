'use client'
import StatsCard from "@/components/stats-card";
import { useEffect, useState } from "react";
import { DashboardMetrics, Payment } from "@repo/shared-types";
import { BanknoteX, ChartNoAxesCombined, CircleDollarSign, UserRoundMinus, Users } from "lucide-react";
import { ChartAreaInteractive } from "@/components/graph-card";
import { DataTableDemo } from "@/components/data-table";
import { useFetch } from "@/hooks/useFetch";
import { apiClient } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { AlertsWidget } from "@/components/alerts-widget";

export default function Home() {
    const { data: metrics, loading: metricsLoading } = useFetch<DashboardMetrics>(
        async () => await apiClient.getMetrics(),
        []
    );

    const [refreshKey, setRefreshKey] = useState(0);

    const { data: paymentsData, loading: paymentsLoading } = useFetch<Payment[]>(async (): Promise<Payment[]> => {
        const response = await apiClient.get('/payments?status=failed') as any;
        return response;
    }, [refreshKey]);

    const [payments, setPayments] = useState<Payment[]>([]);

    useEffect(() => {
        if (paymentsData) {
            setPayments(paymentsData);
        }
    }, [paymentsData]);

    if (metricsLoading || !metrics) return <div>Loading metrics...</div>;

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
            <Card className="p-6">
                <DataTableDemo data={payments} onUpdate={() => setRefreshKey(prev => prev + 1)}/>
            </Card>
        </>
    )
}