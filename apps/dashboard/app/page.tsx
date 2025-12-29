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

export default function Home() {
    const [metrics, setMetrics] = useState<Omit<DashboardMetrics, 'mrrGrowth'> | null>(null);
    const [payments, setPayments] = useState<Payment[]>([]);

    useEffect(() => {
        setMetrics({
            mrr: Math.random() * 1000,
            activeSubscriptions: Math.random() * 100,
            failedPaymentsCount: Math.random() * 10,
            churnRate: Math.random() * 10
        });
    }, []);

    const { data: paymentsData, loading: paymentsLoading, error: paymentsError } = useFetch<Payment[]>(async (): Promise<Payment[]> => {
        const response = await apiClient.get('/payments?status=failed') as any;
        console.log(response)
        return response;
    });

    useEffect(() => {
        if (paymentsData) {
            setPayments(paymentsData);
        }
    }, [paymentsData]);

    if (!metrics) return null;

    const other = {
        mrr: {
            icon: <CircleDollarSign/>,
            label: 'Monthly Recurring Revenue'
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
            label: 'Churn Rate'
        },
        mrrGrowth: {
            icon: <ChartNoAxesCombined/>,
            label: 'MRR Growth'
        }
    }

    function generateMockRevenueData(days: number = 180): {date: string, amount: number}[] {
        const data: {date: string, amount: number}[] = [];
        let baseAmount = 8000;

        // Loop through the last n days
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            // Generate a random daily fluctuation
            const volatility = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
            const growth = 1.002; // Small daily growth trend
            
            baseAmount = (baseAmount * growth);
            const dailyAmount = baseAmount * volatility;
            
            data.push({
                date: date.toISOString().split('T')[0] as string, // Format YYYY-MM-DD
                amount: Math.round(dailyAmount * 100) / 100,
            });
        }

        return data;
    }

    const revenueData = generateMockRevenueData(180);

    

     return (
        <>
            <div className="flex md:flex-row flex-col gap-4 w-full">
                {Object.entries(metrics).map(([key, value]) => (
                    <StatsCard key={key} metric={{key: key, value: value.toFixed(2), info: other[key]}} />
                ))}
            </div>
            <ChartAreaInteractive data={revenueData}/>
            <Card className="p-6">
                <DataTableDemo data={payments}/>
            </Card>
        </>
    )
}