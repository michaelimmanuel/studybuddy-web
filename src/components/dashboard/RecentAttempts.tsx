"use client";

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import api from '@/lib/api'

interface QuizAttempt {
  id: string
  packageId: string
  score: number
  totalQuestions: number
  correctAnswers: number
  timeSpent: number
  createdAt: string
  package?: {
    id: string
    title: string
  }
}

export default function RecentAttempts() {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)
        const res = await api.get<{ success: boolean; data: QuizAttempt[] }>('/api/quiz/attempts/mine')
        if (!mounted) return
        
        // Sort by date and take the 5 most recent
        const sorted = (res.data || []).sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ).slice(0, 5)
        
        setAttempts(sorted)
      } catch (err: any) {
        console.error('Failed to load attempts:', err)
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
        <h2 className="text-xl font-bold mb-4">Recent Quiz Attempts</h2>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white/5 rounded-lg p-4 animate-pulse h-20" />
          ))}
        </div>
      </div>
    )
  }

  if (attempts.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h2 className="text-xl font-bold mb-4">Recent Quiz Attempts</h2>
        <div className="text-center py-8 text-white/60">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>No quiz attempts yet. Start practicing!</p>
        </div>
      </div>
    )
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Recent Quiz Attempts</h2>

      </div>
      
      <div className="space-y-3">
        {attempts.map((attempt) => {
          const scoreColor = attempt.score >= 80 ? 'text-green-400' : attempt.score >= 60 ? 'text-yellow-400' : 'text-red-400'
          
          return (
            <Link
              key={attempt.id}
              href={`/quiz/${attempt.packageId}/results/${attempt.id}`}
              className="block bg-white/5 hover:bg-white/10 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate mb-1">
                    {attempt.package?.title || 'Unknown Package'}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-white/60">
                    <span>{formatDate(attempt.createdAt)}</span>
                    <span>•</span>
                    <span>{formatTime(attempt.timeSpent)}</span>
                    <span>•</span>
                    <span>{attempt.correctAnswers}/{attempt.totalQuestions} correct</span>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className={`text-2xl font-bold ${scoreColor}`}>
                    {attempt.score.toFixed(1)}%
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
