"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import Button from '@/components/Button'
import { formatIDR } from '@/lib/currency'
import type { Bundle } from '@/types'

export default function BundleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const bundleId = params.id as string
  const [bundle, setBundle] = useState<Bundle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasPurchase, setHasPurchase] = useState(false)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)
        
        // Fetch bundle details
        const bRes = await api.get<{ success: boolean; data: Bundle }>(`/api/bundles/${bundleId}`)
        if (!mounted) return
        setBundle(bRes.data)
        
        // Check if user has purchased this bundle
        try {
          const purRes = await api.get<{ success: boolean; data: any }>('/api/purchases/mine')
          const purchased = (purRes.data.bundles || []).some((p: any) => 
            (p.bundleId || p.bundle?.id) === bundleId
          )
          setHasPurchase(purchased)
        } catch (err) {
          console.error('Failed to check purchase status:', err)
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load bundle')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [bundleId])

  if (loading) return <div>Loading bundle...</div>
  if (error) return <div className="text-red-600">{error}</div>
  if (!bundle) return <div>Bundle not found</div>

  const packagesCount = bundle.bundlePackages?.length || 0
  const totalQuestions = bundle.stats?.totalQuestions || 0
  const savings = bundle.stats?.savingsPercentage || 0
  const originalPrice = bundle.stats?.totalOriginalPrice || bundle.price

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{bundle.title}</h1>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Bundle Overview</CardTitle>
            {savings > 0 && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                Save {savings.toFixed(0)}%
              </span>
            )}
          </div>
          <CardDescription>{bundle.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Price</div>
              <div className="text-2xl font-bold">{formatIDR(bundle.price)}</div>
              {savings > 0 && originalPrice > bundle.price && (
                <div className="text-sm text-muted-foreground line-through">
                  {formatIDR(originalPrice)}
                </div>
              )}
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Packages</div>
              <div className="text-2xl font-bold">{packagesCount}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Questions</div>
              <div className="text-2xl font-bold">{totalQuestions}</div>
            </div>
            {savings > 0 && (
              <div>
                <div className="text-sm text-muted-foreground">Savings</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatIDR(originalPrice - bundle.price)}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-3">Included Packages</h2>
      </div>

      <div className="space-y-3">
        {(bundle.bundlePackages || []).map((bp) => {
          const pkg = bp.package
          const questionCount = pkg.packageQuestions?.length || 0
          
          return (
            <Card key={bp.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{pkg.title}</CardTitle>
                    <CardDescription>{pkg.description}</CardDescription>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm font-semibold">{formatIDR(pkg.price)}</div>
                    <div className="text-xs text-muted-foreground">{questionCount} questions</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                {hasPurchase ? (
                  <Button 
                    onClick={() => router.push(`/quiz/${pkg.id}`)}
                    className="w-full sm:w-auto"
                  >
                    Start Quiz
                  </Button>
                ) : (
                  <Button 
                    onClick={() => router.push(`/dashboard/packages/${pkg.id}`)}
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    View Details
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {!hasPurchase && (
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-center text-sm text-muted-foreground mb-4">
              Purchase this bundle to access all {packagesCount} packages and start taking quizzes
            </p>
            <div className="flex justify-center">
              <Button 
                onClick={() => router.push(`/purchase/bundle/${bundle.id}`)}
                size="lg"
              >
                Purchase Bundle - {formatIDR(bundle.price)}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
