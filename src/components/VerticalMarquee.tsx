"use client"

import { cn } from "@/lib/utils"
import type * as React from "react"

type Direction = "up" | "down"

export function VerticalMarquee({
  items,
  direction = "up",
  duration = 28,
  className,
  itemClassName,
  height = 560,
}: {
  items: React.ReactNode[]
  direction?: Direction
  duration?: number
  className?: string
  itemClassName?: string
  height?: number
}) {
  const dirClass = direction === "up" ? "marquee-up" : "marquee-down"

  // Duplicate items to create seamless loop
  const content = (
    <ul className={cn("flex flex-col gap-4", itemClassName)}>
      {items.map((el, i) => (
        <li key={i}>{el}</li>
      ))}
    </ul>
  )

  return (
    <div className={cn("relative overflow-hidden", className)} style={{ height }}>
      <div
        className={cn("flex flex-col gap-4", dirClass)}
        style={{
          ["--marquee-duration" as string]: `${duration}s`,
          ["--marquee-gap" as string]: "1rem", // matches gap-4
        }}
      >
        {content}
        {/* aria-hidden duplication for seamless scroll */}
        <div aria-hidden="true">{content}</div>
      </div>
    </div>
  )
}
