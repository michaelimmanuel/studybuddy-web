"use client";

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import api from '@/lib/api'
import { formatIDR } from '@/lib/currency'

type Package = {
  id: string
  title: string
  description?: string
  price: number
  isActive: boolean
  packageQuestions?: any[]
}

export default function PackageList() {
  const [packages, setPackages] = useState<Package[]>([])
  const [purchases, setPurchases] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)
        const resp = await api.get<{ success: boolean; data: any }>("/api/packages")
        const pkgs = resp.data as Package[]
        const pur = await api.get<{ success: boolean; data: any }>("/api/purchases/mine")
        const owned = (pur.data.packages || []).map((p: any) => p.packageId || p.package?.id || p.package?.id)
        if (!mounted) return
        setPackages(pkgs)
        setPurchases(owned)
      } catch (err: any) {
        console.error(err)
        setError(err?.message || 'Failed to load packages')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  if (loading) return <div>Loading packages...</div>
  if (error) return <div className="text-red-600">{error}</div>

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {packages.map((pkg) => {
        const enrolled = purchases.includes(pkg.id)
        return (
          <Card key={pkg.id} className="p-0">
            <CardHeader className="px-4 py-3">
              <CardTitle>{pkg.title}</CardTitle>
              <CardDescription>{pkg.description}</CardDescription>
            </CardHeader>
            <CardContent className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">{formatIDR(pkg.price)}</div>
                <div>
                  {enrolled ? (
                    <Link href={`/quiz/${pkg.id}`} className="inline-flex items-center px-3 py-1 rounded bg-blue-600 text-white">Start</Link>
                  ) : (
                    <Link href={`/dashboard/packages/${pkg.id}`} className="inline-flex items-center px-3 py-1 rounded border">View</Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
