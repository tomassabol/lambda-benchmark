"use client"

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import { Badge } from "~/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart"
import { type MetricsData } from "~/types"

const chartConfig = {
  warmStartDuration: {
    label: "Warm Start Duration",
    color: "hsl(var(--chart-2))",
  },
  coldStartDuration: {
    label: "Cold Start Duration",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

type ChartData = Omit<MetricsData, "timestamp"> & { timestamp: string }

export function Chart({ chartData }: { chartData: ChartData[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-md font-semibold">
          {chartData[0]?.language} - {chartData[0]?.architecture}
        </CardTitle>
        <CardDescription className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Badge variant="outline">{chartData[0]?.runtime}</Badge>
            <Badge variant="outline">{chartData[0]?.language}</Badge>
            <Badge variant="outline">{chartData[0]?.architecture}</Badge>
          </div>
          <p>Cold Start vs Warm Start Duration (miliseconds)</p>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <ChartContainer config={chartConfig}>
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="timestamp"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                dataKey="coldStartDuration"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <Line
                dataKey="warmStartDuration"
                type="monotone"
                stroke="var(--color-warmStartDuration)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="coldStartDuration"
                type="monotone"
                stroke="var(--color-coldStartDuration)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
