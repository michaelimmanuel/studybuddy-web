"use client"

import { PolarAngleAxis, PolarGrid, Radar, RadarChart as ReRadarChart, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

type CoursePerf = {
  courseId: string
  courseTitle: string
  scorePercent: number
}

export default function RadarChart({ data }: { data: CoursePerf[] }) {
  // Recharts expects an array of {axisLabel, value}
  const chartData = data.map((d) => ({ month: d.courseTitle, desktop: d.scorePercent }))

  return (
    <Card>
      <CardHeader className="items-center pb-4">
        <CardTitle>Performance by Course</CardTitle>
        <CardDescription>Overview of scores across your question banks</CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer className="mx-auto w-full max-w-4xl h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <ReRadarChart data={chartData}>
              <Tooltip content={<ChartTooltipContent />} />
              <PolarAngleAxis dataKey="month" />
              <PolarGrid />
              <Radar name="Score" dataKey="desktop" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
            </ReRadarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
