"use client";

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function SideNav() {
  const pathname = usePathname()
  
  const links = [
    {
      href: '/dashboard/summary',
      label: 'Summary',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      href: '/dashboard/bundles',
      label: 'My Bundles',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      href: '/dashboard/shop',
      label: 'Shop Bundles',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    }
  ]
  
  return (
    <nav className="bg-white/10 backdrop-blur-sm text-white rounded-xl p-4 shadow-xl border border-white/20 sticky top-24">
      <div className="mb-4 pb-3 border-b border-white/10">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider px-3">Navigation</h2>
      </div>
      <ul className="space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname?.startsWith(link.href + '/')
          return (
            <li key={link.href}>
              <Link 
                href={link.href} 
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30 font-medium' 
                    : 'hover:bg-white/10 text-white/80 hover:text-white'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
