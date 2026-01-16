"use client";

import React, { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import api from '@/lib/api'
import { formatIDR } from '@/lib/currency'
import Button from '@/components/Button'
import ImageUpload from '@/components/ImageUpload'
import type { Bundle } from '@/types'

export default function ShopPage() {
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [purchases, setPurchases] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [referralCode, setReferralCode] = useState('')
  const [proofImageUrl, setProofImageUrl] = useState('')
  const [purchasing, setPurchasing] = useState(false)
  const [purchaseError, setPurchaseError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Fetch user's purchases
      const pur = await api.get<{ success: boolean; data: any }>("/api/purchases/mine")
      const ownedBundleIds = (pur.data.bundles || []).map((p: any) => p.bundleId || p.bundle?.id)
      
      // Fetch all active bundles
      const resp = await api.get<{ success: boolean; data: Bundle[] }>("/api/bundles")
      const bundlesData = resp.data
      
      setBundles(bundlesData)
      setPurchases(ownedBundleIds)
    } catch (err: any) {
      console.error(err)
      setError(err?.message || 'Failed to load bundles')
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async () => {
    if (!selectedBundle) return
    
    if (!proofImageUrl) {
      setPurchaseError('Please upload payment proof image')
      return
    }
    
    setPurchasing(true)
    setPurchaseError(null)
    
    try {
      await api.post('/api/purchases/bundle', {
        bundleId: selectedBundle.id,
        proofImageUrl,
        referralCode: referralCode || undefined
      })
      
      // Reload data to refresh purchases
      await loadData()
      setShowPurchaseModal(false)
      setSelectedBundle(null)
      setReferralCode('')
      setProofImageUrl('')
      
      // Show success message
      alert('Purchase request submitted! Please wait for admin approval.')
    } catch (err: any) {
      setPurchaseError(err?.data?.message || err?.message || 'Failed to submit purchase')
    } finally {
      setPurchasing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="space-y-3 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white/70">Loading bundles...</p>
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

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold">Shop Bundles</h1>
        </div>
        <p className="text-white/70 text-sm">Browse and purchase study material bundles</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {bundles.map((bundle) => {
          const owned = purchases.includes(bundle.id)
          const packagesCount = bundle.stats?.packagesCount || bundle.bundlePackages?.length || 0
          const questionsCount = bundle.stats?.totalQuestions || 0
          const savings = bundle.stats?.savingsPercentage || 0
          
          return (
            <div key={bundle.id} className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:border-white/40 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20 overflow-hidden h-full flex flex-col">
                {/* Header */}
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
                      {owned && (
                        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full border border-blue-500/30">
                          Owned
                        </span>
                      )}
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
                  
                  {owned ? (
                    <Button
                      onClick={() => window.location.href = `/dashboard/bundles/${bundle.id}`}
                      className="w-full"
                    >
                      View Bundle
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        setSelectedBundle(bundle)
                        setShowPurchaseModal(true)
                      }}
                      className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400"
                    >
                      Purchase Bundle
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && selectedBundle && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Purchase Bundle</h3>
                <button
                  onClick={() => {
                    setShowPurchaseModal(false)
                    setSelectedBundle(null)
                    setPurchaseError(null)
                    setReferralCode('')
                  }}
                  className="text-white/60 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h4 className="font-semibold text-white mb-1">{selectedBundle.title}</h4>
                <p className="text-sm text-white/60 mb-3">{selectedBundle.description}</p>
                <div className="text-2xl font-bold text-blue-300">{formatIDR(selectedBundle.price)}</div>
              </div>

              {/* QR Code Payment */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <label className="block text-sm font-medium text-white/80 mb-3">
                  Scan QR Code to Pay
                </label>
                <div className="flex justify-center">
                  <img 
                    src="/img/QR.jpg" 
                    alt="Payment QR Code" 
                    className="w-64 h-64 object-contain rounded-lg bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Referral Code (Optional)
                </label>
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="Enter code"
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Payment Proof Upload */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <ImageUpload
                  onUploadComplete={setProofImageUrl}
                  onUploadError={(err) => setPurchaseError(err)}
                  currentImageUrl={proofImageUrl}
                  folder="payment-proofs"
                  label="Payment Proof"
                  buttonText="Upload Payment Proof"
                  maxSizeMB={5}
                />
              </div>

              {purchaseError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-sm text-red-200">{purchaseError}</p>
                </div>
              )}

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <p className="text-sm text-blue-200">
                  <strong>Note:</strong> After submitting, please wait for admin approval. You'll receive access once confirmed.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPurchaseModal(false)
                    setSelectedBundle(null)
                    setPurchaseError(null)
                    setReferralCode('')
                    setProofImageUrl('')
                  }}
                  disabled={purchasing}
                  className="flex-1 bg-white/10 border-2 border-white/40 text-white hover:bg-white/20 hover:border-white/60"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePurchase}
                  disabled={purchasing}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-500"
                >
                  {purchasing ? 'Processing...' : 'Confirm Purchase'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
