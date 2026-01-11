import BundleList from '@/components/dashboard/BundleList'
import StatsOverview from '@/components/dashboard/StatsOverview'
import RecentAttempts from '@/components/dashboard/RecentAttempts'
import ProgressTracker from '@/components/dashboard/ProgressTracker'

export default function BundlesPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold">My Bundles</h1>
        </div>
        <p className="text-white/70 text-sm">Access your purchased bundles and start practicing</p>
      </div>
      
      <StatsOverview />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentAttempts />
        <ProgressTracker />
      </div>
      
      <BundleList />
    </div>
  )
}
