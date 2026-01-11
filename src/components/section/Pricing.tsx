'use client';

import React, { useEffect, useState } from 'react'
import api from '@/lib/api'
import { formatIDR } from '@/lib/currency'
import type { Bundle } from '@/types'
import { useRouter } from 'next/navigation'

const Pricing = () => {
  const router = useRouter()
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBundles()
  }, [])

  const loadBundles = async () => {
    try {
      const resp = await api.get<{ success: boolean; data: Bundle[] }>("/api/bundles")
      setBundles(resp.data)
    } catch (err) {
      console.error('Failed to load bundles:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleBundleClick = (bundleId: string) => {
    // Check if user is logged in by trying to get user data
    api.get('/api/users/me')
      .then(() => {
        // User is logged in, redirect to shop
        router.push('/dashboard/shop')
      })
      .catch(() => {
        // User not logged in, scroll to top for login
        window.scrollTo({ top: 0, behavior: 'smooth' })
      })
  }

  if (loading) {
    return (
      <section id="pricing" className="py-12 px-4 md:px-48 bg-gradient-to-b from-[#002644] to-[#005FAA]">
        <h2 className="text-3xl font-bold mb-6 text-center text-white">Pricing</h2>
        <div className="flex flex-col gap-8 w-8/12 mx-auto">
          <div className="animate-pulse bg-white/10 rounded-2xl h-48"></div>
          <div className="animate-pulse bg-white/10 rounded-2xl h-48"></div>
        </div>
      </section>
    )
  }

  return (
    <section id="pricing" className="py-12 px-4 md:px-48 bg-gradient-to-b from-[#002644] to-[#005FAA]">
      <h2 className="text-3xl font-bold mb-6 text-center text-white">Pricing</h2>
      <div className="flex flex-col gap-8 w-8/12 mx-auto">

        {bundles.map((bundle, index) => {
          const packagesCount = bundle.stats?.packagesCount || bundle.bundlePackages?.length || 0
          const questionsCount = bundle.stats?.totalQuestions || 0
          const isEven = index % 2 === 0
          
          return (
            <div key={bundle.id} className="relative rounded-2xl backdrop-blur-md border border-white/20 shadow-xl p-1" style={{background: 'radial-gradient(circle, rgba(0, 95, 170, 0.4) 0%, rgba(0, 95, 170, 0.2) 100%)'}}>
              <div className="rounded-xl backdrop-blur-sm p-8 flex flex-col md:flex-row items-center justify-between" style={{background: 'radial-gradient(circle, rgba(0, 38, 68, 0.5) 0%, rgba(0, 38, 68, 0.3) 100%)'}}>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`${isEven ? 'bg-white' : 'bg-white/20'} rounded-lg p-2`}>
                      <img src="/img/tooth-icon.png" alt="" className='w-8 h-8'/>
                    </div>
                    <span className="text-white text-3xl font-bold">{bundle.title}</span>
                  </div>
                  <div className="flex gap-4 mb-4">
                    <div className="bg-white/30 rounded-lg px-6 py-2 text-xl font-bold text-white">
                      {formatIDR(bundle.price)}
                    </div>
                    <button 
                      onClick={() => handleBundleClick(bundle.id)}
                      className="bg-white text-[#002644] font-semibold rounded-lg px-6 py-2 hover:bg-gray-100 transition"
                    >
                      Mulai Belajar
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-6 mt-4">
                    <div className="flex items-center gap-2 text-white">
                      <span className="text-xl">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check-icon lucide-circle-check"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                      </span>
                      {packagesCount} {packagesCount === 1 ? 'Package' : 'Packages'}
                    </div>
                    <div className="flex items-center gap-2 text-white">
                      <span className="text-xl">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check-icon lucide-circle-check"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                      </span>
                      {questionsCount} Questions
                    </div>
                    <div className="flex items-center gap-2 text-white">
                      <span className="text-xl">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check-icon lucide-circle-check"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                      </span>
                      Bisa diakses kapanpun dimanapun
                    </div>
                    {bundle.description && (
                      <div className="flex items-center gap-2 text-white">
                        <span className="text-xl">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check-icon lucide-circle-check"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                        </span>
                        {bundle.description}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1 flex justify-end items-center absolute bottom-0 -right-2">
                  <img 
                    src={isEven ? "/img/xavi-doctor.png" : "/img/olinee-doctor.png"} 
                    alt={`${bundle.title} Doctor`} 
                    className="w-40 h-40 object-contain" 
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default Pricing