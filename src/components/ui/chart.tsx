"use client"

import * as React from "react"

export type ChartConfig = Record<string, { label: string; color?: string }>

export function ChartContainer({
  children,
  className,
}: React.PropsWithChildren<{ className?: string; config?: ChartConfig }>) {
  return (
    <div className={className ?? "w-full h-full relative"}>
      {children}
    </div>
  )
}

export function ChartTooltip({ content }: { content?: React.ReactNode }) {
  // Placeholder wrapper for Recharts Tooltip usage in examples.
  return <>{content}</>
}

export function ChartTooltipContent({ payload }: { payload?: any }) {
  if (!payload || !payload.length) return null
  const item = payload[0]
  return (
    <div className="rounded-md border bg-popover p-2 text-sm">
      <div className="font-medium">{item.name}</div>
      <div className="text-muted-foreground">{item.value}</div>
    </div>
  )
}

export default ChartContainer
