"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import Button from '@/components/Button'
import { formatIDR } from '@/lib/currency'

export default function PackageDetailPage() {
  const params = useParams()
  const router = useRouter()
  const packageId = params.id as string
  const [resource, setResource] = useState<any | null>(null)
  const [resourceType, setResourceType] = useState<'package' | 'bundle' | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)
        // Prefer package endpoint (link from PackageList uses package ids).
        try {
          const pRes = await api.get<{ success: boolean; data: any }>(`/api/packages/${packageId}`)
          if (!mounted) return
          setResource(pRes.data)
          setResourceType('package')
          return
        } catch (err: any) {
          // if package not found (404), fall back to bundle lookup
          if (err?.status && err.status !== 404) throw err
        }

        // try bundle lookup
        try {
          const bRes = await api.get<{ success: boolean; data: any }>(`/api/bundles/${packageId}`)
          if (!mounted) return
          setResource(bRes.data)
          setResourceType('bundle')
          return
        } catch (err: any) {
          throw err
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load resource')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [packageId])

  if (loading) return <div>Loading package...</div>
  if (error) return <div className="text-red-600">{error}</div>
  if (!resource) return <div>Resource not found</div>

  if (resourceType === 'package') {
    const pkg = resource
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">{pkg.title}</h1>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{pkg.title}</CardTitle>
            <CardDescription>{pkg.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="text-lg font-semibold">{formatIDR(pkg.price)}</div>
              <div className="text-sm text-muted-foreground">Questions: {pkg.packageQuestions?.length ?? 0}</div>
            </div>
            <div>
              <Button onClick={() => router.push(`/quiz/${pkg.id}`)}>Start</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // bundle view
  const bundle = resource
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{bundle.title}</h1>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>{bundle.title}</CardTitle>
          <CardDescription>{bundle.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="text-lg font-semibold">{formatIDR(bundle.price)}</div>
            <div className="text-sm text-muted-foreground">Packages: {bundle.bundlePackages?.length ?? 0} • Questions: {bundle.stats?.totalQuestions ?? 0}</div>
          </div>

          <div className="space-y-3">
            {(bundle.bundlePackages || []).map((bp: any) => {
              const p = bp.package
              return (
                <div key={p.id} className="p-3 border rounded flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium">{p.title}</div>
                    <div className="text-sm text-muted-foreground">Questions: {p.packageQuestions?.length ?? 0}</div>
                  </div>
                  <div className="flex-shrink-0">
                    <Button onClick={() => router.push(`/quiz/${p.id}`)}>Start</Button>
                  </div>
                </div>
              )
            })}
          </div>

        </CardContent>
      </Card>
    </div>
  )
}
