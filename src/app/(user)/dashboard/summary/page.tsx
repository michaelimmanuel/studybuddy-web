"use client"

import { useEffect, useState } from "react"
import SummaryPanel from '@/components/dashboard/SummaryPanel'
import api from '@/lib/api'

export default function SummaryPage() {
  const [name, setName] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const json = await api.get('/api/users/me')
        if (!mounted) return
        setName(json.user?.name ?? json.user?.email ?? 'there')
      } catch (err) {
        // ignore — show generic greeting
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Halo, {name ?? 'there'}</h1>
      <h1 className="text-2xl font-bold mb-4">Ayo Belajar Lagi! Semangat!</h1>

      <SummaryPanel />
    </div>
  )
}
