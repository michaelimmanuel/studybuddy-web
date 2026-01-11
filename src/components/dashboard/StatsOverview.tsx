"use client";

import React, { useEffect, useState } from 'react'
import api from '@/lib/api'

interface Stats {
  totalBundles: number
  totalQuestions: number
  quizzesTaken: number
  averageScore: number
}

export default function StatsOverview() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)
        
        // Fetch purchases to count bundles and questions
        const purRes = await api.get<{ success: boolean; data: any }>('/api/purchases/mine')
        const bundles = purRes.data.bundles || []
        
        // Fetch quiz attempts
        const attemptsRes = await api.get<{ success: boolean; data: any }>('/api/quiz/attempts/mine')
        const attempts = attemptsRes.data || []
        
        // Calculate total questions from bundles
        let totalQuestions = 0
        for (const bundlePurchase of bundles) {
          const bundleId = bundlePurchase.bundleId || bundlePurchase.bundle?.id
          if (bundleId) {
            try {
              const bundleRes = await api.get<{ success: boolean; data: any }>(`/api/bundles/${bundleId}`)
              const bundle = bundleRes.data
              totalQuestions += bundle.stats?.totalQuestions || 0
            } catch (err) {
              console.error('Failed to fetch bundle:', err)
            }
          }
        }
        
        // Calculate average score
        const avgScore = attempts.length > 0
          ? attempts.reduce((sum: number, a: any) => sum + (a.score || 0), 0) / attempts.length
          : 0
        
        if (!mounted) return
        setStats({
          totalBundles: bundles.length,
          totalQuestions,
          quizzesTaken: attempts.length,
          averageScore: avgScore
        })
      } catch (err: any) {
        console.error('Failed to load stats:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 animate-pulse h-32" />
        ))}
      </div>
    )
  }

  const statCards = [
    {
      label: 'Total Bundles',
      value: stats.totalBundles,
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'Total Questions',
      value: stats.totalQuestions.toLocaleString(),
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      label: 'Quizzes Taken',
      value: stats.quizzesTaken,
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      label: 'Average Score',
      value: `${stats.averageScore.toFixed(1)}%`,
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      gradient: 'from-orange-500 to-red-500'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card, index) => (
        <div
          key={index}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-lg bg-gradient-to-br ${card.gradient} bg-opacity-20`}>
              {card.icon}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-white">{card.value}</p>
            <p className="text-sm text-white/60">{card.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
