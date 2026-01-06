"use client"

"use client"

import RadarChart from "./RadarChart"
import { useEffect, useState } from "react"
import api from "@/lib/api"

type CoursePerf = { courseId: string; courseTitle: string; scorePercent: number }

export default function SummaryPanel() {
  const [data, setData] = useState<CoursePerf[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const json = await api.get("/api/dashboard/summary")
        const performances = (json.coursePerformances || []).map((c: any) => ({
          courseId: c.courseId,
          courseTitle: c.courseTitle,
          scorePercent: c.scorePercent,
        }))
        if (!mounted) return
        setData(performances)
      } catch (err: any) {
        console.error("Failed to load dashboard summary", err)
        setError(err?.message || "Failed to load")
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [])

  if (loading) return <div>Loading summary...</div>
  if (error) return <div className="text-red-600">Error loading summary: {error}</div>
  if (!data || data.length === 0) return <div>No performance data available.</div>

  return (
    <div className="space-y-4">
      <RadarChart data={data} />
    </div>
  )
}
