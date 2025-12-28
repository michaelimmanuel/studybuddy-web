"use client";

import React from 'react'
import Link from 'next/link'

export default function SideNav() {
  return (
    <nav className="bg-[#002644]/95 text-white rounded-lg p-4 shadow-lg border border-white/10">
      <ul className="space-y-2">
        <li>
          <Link href="/dashboard/summary" className="block px-3 py-2 rounded hover:bg-[#005FAA]/20 transition-colors">Summary</Link>
        </li>
        <li>
          <Link href="/dashboard/packages" className="block px-3 py-2 rounded hover:bg-[#005FAA]/20 transition-colors">Package</Link>
        </li>
      </ul>
    </nav>
  )
}
