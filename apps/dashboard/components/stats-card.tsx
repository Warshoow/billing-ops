import type { JSX } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";

export default function StatsCard({metric}: {metric: {key: string, value: string | number, info: {icon: JSX.Element, label: string}}}) {
  

    return (
        <Card className="w-full py-4">
        <CardHeader>
          <CardDescription className="text-nowrap flex items-center gap-2">
            {metric.info.icon}
            {metric.info.label}
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {metric.value}
          </CardTitle>
        </CardHeader>
      </Card>
    )
}