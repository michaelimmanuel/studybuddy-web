"use client";

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import api from '@/lib/api'
import { formatIDR } from '@/lib/currency'
import type { Bundle } from '@/types'

export default function BundleList() {
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [purchases, setPurchases] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)
        
        // Fetch user's purchases first
        const pur = await api.get<{ success: boolean; data: any }>("/api/purchases/mine")
        const ownedBundleIds = (pur.data.bundles || []).map((p: any) => p.bundleId || p.bundle?.id)
        
        // Fetch all bundles
        const resp = await api.get<{ success: boolean; data: Bundle[] }>("/api/bundles")
        const bundlesData = resp.data
        
        // Filter to only show purchased bundles
        const purchasedBundles = bundlesData.filter((bundle) => ownedBundleIds.includes(bundle.id))
        
        if (!mounted) return
        setBundles(purchasedBundles)
        setPurchases(ownedBundleIds)
      } catch (err: any) {
        console.error(err)
        setError(err?.message || 'Failed to load bundles')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="space-y-3 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white/70">Loading your bundles...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-200">{error}</p>
        </div>
      </div>
    )
  }
  
  if (bundles.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-12 text-center border border-white/10">
        <div className="max-w-md mx-auto space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-2">
            <svg className="w-8 h-8 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white">No Bundles Yet</h3>
          <p className="text-white/60">You haven't purchased any bundles yet. Contact support to get access to study materials.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {bundles.map((bundle) => {
        const enrolled = purchases.includes(bundle.id)
        const packagesCount = bundle.stats?.packagesCount || bundle.bundlePackages?.length || 0
        const questionsCount = bundle.stats?.totalQuestions || 0
        const savings = bundle.stats?.savingsPercentage || 0
        
        return (
          <div key={bundle.id} className="group">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:border-white/40 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20 overflow-hidden h-full flex flex-col">
              {/* Header with gradient */}
              <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 px-5 py-4 border-b border-white/10">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-2">
                    {bundle.title}
                  </h3>
                  {savings > 0 && (
                    <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full border border-green-500/30 flex-shrink-0 ml-2">
                      -{savings.toFixed(0)}%
                    </span>
                  )}
                </div>
                {bundle.description && (
                  <p className="text-sm text-white/60 line-clamp-2">{bundle.description}</p>
                )}
              </div>
              
              {/* Content */}
              <div className="px-5 py-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-white">
                      {formatIDR(bundle.price)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-white/70">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span>{packagesCount} {packagesCount === 1 ? 'Package' : 'Packages'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/70">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{questionsCount} Questions</span>
                    </div>
                  </div>
                </div>
                
                <Link 
                  href={`/dashboard/bundles/${bundle.id}`}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 group-hover:scale-[1.02]"
                >
                  <span>View Bundle</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
