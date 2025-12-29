import type { JSX } from "react";
import { Badge } from "./ui/badge";
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

export default function StatsCard({metric}: {metric: {key: string, value: number, info: {icon: JSX.Element, label: string}}}) {
  

    return (
        <Card className="w-full py-4">
        <CardHeader>
          <CardDescription className="text-nowrap">
            {metric.info.icon}
            {metric.info.label}
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ${metric.value}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Trending up this month <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Visitors for the last 6 months
          </div>
        </CardFooter>
      </Card>
    )
}