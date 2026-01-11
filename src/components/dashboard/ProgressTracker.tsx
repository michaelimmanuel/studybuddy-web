"use client";

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import api from '@/lib/api'

interface PackageProgress {
  packageId: string
  packageTitle: string
  totalQuestions: number
  attemptsCount: number
  bestScore: number
  lastAttemptDate: string | null
}

export default function ProgressTracker() {
  const [progress, setProgress] = useState<PackageProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)
        
        // Fetch user's bundles
        const purRes = await api.get<{ success: boolean; data: any }>('/api/purchases/mine')
        const bundles = purRes.data.bundles || []
        
        // Fetch all quiz attempts
        const attemptsRes = await api.get<{ success: boolean; data: any }>('/api/quiz/attempts/mine')
        const attempts = attemptsRes.data || []
        
        // Build progress data for each package
        const progressMap = new Map<string, PackageProgress>()
        
        // Get all packages from bundles
        for (const bundlePurchase of bundles) {
          const bundleId = bundlePurchase.bundleId || bundlePurchase.bundle?.id
          if (bundleId) {
            try {
              const bundleRes = await api.get<{ success: boolean; data: any }>(`/api/bundles/${bundleId}`)
              const bundle = bundleRes.data
              
              if (bundle.bundlePackages) {
                for (const bp of bundle.bundlePackages) {
                  const pkg = bp.package
                  if (pkg && !progressMap.has(pkg.id)) {
                    progressMap.set(pkg.id, {
                      packageId: pkg.id,
                      packageTitle: pkg.title,
                      totalQuestions: pkg.packageQuestions?.length || 0,
                      attemptsCount: 0,
                      bestScore: 0,
                      lastAttemptDate: null
                    })
                  }
                }
              }
            } catch (err) {
              console.error('Failed to fetch bundle:', err)
            }
          }
        }
        
        // Update progress with attempt data
        for (const attempt of attempts) {
          const pkgProgress = progressMap.get(attempt.packageId)
          if (pkgProgress) {
            pkgProgress.attemptsCount++
            pkgProgress.bestScore = Math.max(pkgProgress.bestScore, attempt.score || 0)
            if (!pkgProgress.lastAttemptDate || new Date(attempt.createdAt) > new Date(pkgProgress.lastAttemptDate)) {
              pkgProgress.lastAttemptDate = attempt.createdAt
            }
          }
        }
        
        if (!mounted) return
        setProgress(Array.from(progressMap.values()))
      } catch (err: any) {
        console.error('Failed to load progress:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h2 className="text-xl font-bold mb-4">Package Progress</h2>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white/5 rounded-lg p-4 animate-pulse h-24" />
          ))}
        </div>
      </div>
    )
  }

  if (progress.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h2 className="text-xl font-bold mb-4">Package Progress</h2>
        <div className="text-center py-8 text-white/60">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p>No packages available yet.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
      <h2 className="text-xl font-bold mb-4">Package Progress</h2>
      
      <div className="space-y-3">
        {progress.map((pkg) => {
          const isStarted = pkg.attemptsCount > 0
          const scoreColor = pkg.bestScore >= 80 ? 'text-green-400' : pkg.bestScore >= 60 ? 'text-yellow-400' : pkg.bestScore > 0 ? 'text-red-400' : 'text-white/40'
          
          return (
            <div
              key={pkg.packageId}
              className="bg-white/5 rounded-lg p-4 border border-white/10"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate mb-1">
                    {pkg.packageTitle}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-white/60">
                    <span>{pkg.totalQuestions} questions</span>
                    {isStarted && (
                      <>
                        <span>•</span>
                        <span>{pkg.attemptsCount} {pkg.attemptsCount === 1 ? 'attempt' : 'attempts'}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className={`text-xl font-bold ${scoreColor}`}>
                    {isStarted ? `${pkg.bestScore.toFixed(0)}%` : '—'}
                  </div>
                  <div className="text-xs text-white/60">
                    {isStarted ? 'Best' : 'Not Started'}
                  </div>
                </div>
              </div>
              
              <Link
                href={`/quiz/${pkg.packageId}`}
                className="block w-full text-center px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-medium transition-all duration-300"
              >
                {isStarted ? 'Practice Again' : 'Start Quiz'}
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
