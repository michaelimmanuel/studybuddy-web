"use client";

import React from "react";
import SideNav from "@/components/dashboard/SideNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#002644] to-[#005FAA] text-white pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
          <aside className="lg:col-span-1">
            <SideNav />
          </aside>
          <main className="lg:col-span-5 space-y-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
