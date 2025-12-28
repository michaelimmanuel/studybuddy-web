"use client";

import React from 'react'

export default function PackageDetail({ packageId }: { packageId: string }) {
  return (
    <div className="bg-white/10 text-white rounded-lg p-6 shadow-lg border border-white/10">
      <p className="text-white/90">Package detail placeholder for {packageId}</p>
    </div>
  )
}
