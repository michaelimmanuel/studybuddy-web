"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api, { ApiError, clearToken } from "@/lib/api";
import Button from "@/components/Button";
import type { GetMyPurchasesResponse, PackagePurchase, BundlePurchase, Bundle, GetMyAttemptsResponse, QuizAttempt } from "@/types";

type User = {
    user : {
        id: string;
        name?: string;
        email?: string;
    }
};

export default function OldDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pkgPurchases, setPkgPurchases] = useState<PackagePurchase[]>([]);
  const [bundlePurchases, setBundlePurchases] = useState<BundlePurchase[]>([]);
  const [purchasedBundles, setPurchasedBundles] = useState<Bundle[]>([]);
  const [expandedBundles, setExpandedBundles] = useState<Set<string>>(new Set());
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);

  useEffect(() => {
    let mounted = true;
    async function fetchProfileAndPurchases() {
      setLoading(true);
      setError(null);
      try {
        const [profile, purchases] = await Promise.all([
          api.get<User>("/api/users/me", { timeout: 5000 }),
          api.get<GetMyPurchasesResponse>("/api/purchases/mine", { timeout: 5000 }),
        ]);
        if (mounted) {
          setUser(profile);
          setPkgPurchases(purchases.data.packages || []);
          setBundlePurchases(purchases.data.bundles || []);
          
          // Fetch full bundle details for each purchased bundle
          if (purchases.data.bundles && purchases.data.bundles.length > 0) {
            const bundleIds = purchases.data.bundles.map(b => b.bundleId);
            const bundleDetailsPromises = bundleIds.map(id => 
              api.get<{ success: boolean; data: Bundle }>(`/api/bundles/${id}`, { timeout: 5000 })
            );
            const bundleDetailsResults = await Promise.all(bundleDetailsPromises);
            const bundleDetails = bundleDetailsResults.map(r => r.data);
            setPurchasedBundles(bundleDetails);
          }
          
          // Fetch user's quiz attempts
          try {
            const attemptsResponse = await api.get<GetMyAttemptsResponse>("/api/quiz/attempts/mine", { timeout: 5000 });
            setQuizAttempts(attemptsResponse.data || []);
          } catch (err) {
            console.error("Failed to fetch quiz attempts:", err);
            // Don't fail the whole page if attempts fail to load
          }
        }
      } catch (err) {
        if (err instanceof ApiError) setError(err.data?.message ?? err.message);
        else if (err instanceof Error) setError(err.message);
        else setError("Failed to fetch profile");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchProfileAndPurchases();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleLogout() {
    try {
      // Better Auth uses /sign-out endpoint
      await api.post("/api/auth/sign-out", {});
    } catch (err) {
      console.error("Logout error:", err);
      // Continue with logout even if API call fails
    }
    clearToken();
    router.push("/");
  }

  const toggleBundle = (bundleId: string) => {
    setExpandedBundles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bundleId)) {
        newSet.delete(bundleId);
      } else {
        newSet.add(bundleId);
      }
      return newSet;
    });
  };

  // Check if user has attempted a quiz for a specific package
  const getPackageAttempt = (packageId: string): QuizAttempt | undefined => {
    return quizAttempts.find(attempt => attempt.packageId === packageId);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium"
        >
          Logout
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-600">Loading your dashboard...</div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-3 space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 shadow-sm border border-blue-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Welcome back{user?.user.name ? `, ${user.user.name}` : ''}! 👋
              </h2>
              <p className="text-gray-600 mb-4">Ready to continue your learning journey?</p>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => router.push("/bundles")} variant="outline">
                  📦 Browse Bundles
                </Button>
              </div>
            </div>

            {/* My Bundles Section */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">My Bundles</h3>
                  <p className="text-sm text-gray-500">
                    {purchasedBundles.length > 0 
                      ? `You have ${purchasedBundles.length} bundle${purchasedBundles.length > 1 ? 's' : ''}`
                      : 'No bundles yet'}
                  </p>
                </div>
                {purchasedBundles.length > 0 && (
                  <Button variant="outline" size="sm" onClick={() => router.push("/bundles")}> 
                    + Get More
                  </Button>
                )}
              </div>

              {/* Show pending approvals notice */}
              {bundlePurchases.some(b => !b.approved) && (
                <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">⏳</div>
                    <div>
                      <p className="font-semibold text-yellow-800">Pending Approval</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        You have {bundlePurchases.filter(b => !b.approved).length} bundle purchase{bundlePurchases.filter(b => !b.approved).length > 1 ? 's' : ''} waiting for admin approval. You'll be able to access the content once confirmed.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {purchasedBundles.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-4xl mb-3">📦</div>
                  <p className="text-gray-600 mb-4">You haven't purchased any bundles yet.</p>
                  <Button onClick={() => router.push("/bundles")}>Browse Bundles</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {purchasedBundles.map(bundle => {
                    const isExpanded = expandedBundles.has(bundle.id);
                    const packages = bundle.bundlePackages || [];
                    
                    return (
                      <div key={bundle.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* Bundle Header */}
                        <div 
                          className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-colors"
                          onClick={() => toggleBundle(bundle.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-semibold text-lg text-gray-800">{bundle.title}</h4>
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                                  {packages.length} package{packages.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                              {bundle.description && (
                                <p className="text-sm text-gray-600 mt-1">{bundle.description}</p>
                              )}
                              {bundle.stats && (
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 flex-wrap">
                                  <span>📝 {bundle.stats.totalQuestions} questions</span>
                                 
                                </div>
                              )}
                            </div>
                            <button className="text-gray-400 hover:text-gray-600 transition-transform duration-200 ml-2" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Package List (Collapsible) */}
                        {isExpanded && (
                          <div className="bg-white divide-y divide-gray-100">
                            {packages.length === 0 ? (
                              <div className="p-4 text-center text-gray-500 text-sm">
                                No packages in this bundle
                              </div>
                            ) : (
                              packages
                                .sort((a, b) => (a.order || 0) - (b.order || 0))
                                .map((bp, index) => {
                                  const pkg = bp.package;
                                  const questionCount = pkg.packageQuestions?.length || 0;
                                  const attempt = getPackageAttempt(pkg.id);
                                  
                                  return (
                                    <div key={bp.id} className="p-4 hover:bg-gray-50 transition-colors">
                                      <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2">
                                            <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex-shrink-0">
                                              {index + 1}
                                            </span>
                                            <h5 className="font-medium text-gray-800 truncate">{pkg.title}</h5>
                                            {attempt && (
                                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium whitespace-nowrap">
                                                ✓ Completed
                                              </span>
                                            )}
                                          </div>
                                          {pkg.description && (
                                            <p className="text-sm text-gray-600 mt-1 ml-8 line-clamp-2">{pkg.description}</p>
                                          )}
                                          <div className="flex items-center gap-4 mt-2 ml-8 text-xs text-gray-500 flex-wrap">
                                            <span>📝 {questionCount} question{questionCount !== 1 ? 's' : ''}</span>
                                            {pkg.timeLimit && (
                                              <span>⏱️ {pkg.timeLimit} min{pkg.timeLimit !== 1 ? 's' : ''}</span>
                                            )}
                                           
                                            {attempt && (
                                              <span className="text-blue-600 font-medium">
                                                Score: {attempt.score.toFixed(2)}%
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        {attempt ? (
                                          <Button 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              router.push(`/quiz/${pkg.id}/results/${attempt.id}`);
                                            }}
                                            size="sm"
                                            variant="outline"
                                            className="flex-shrink-0"
                                          >
                                            View Results →
                                          </Button>
                                        ) : (
                                          <Button 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              router.push(`/quiz/${pkg.id}`);
                                            }}
                                            size="sm"
                                            className="flex-shrink-0"
                                          >
                                            Start Quiz →
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Individual Packages (not part of bundles) */}
            {pkgPurchases.length > 0 && (
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Individual Packages</h3>
                    <p className="text-sm text-gray-500">Packages purchased separately</p>
                  </div>
                </div>

                {/* Show pending approvals notice */}
                {pkgPurchases.some(p => !p.approved) && (
                  <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">⏳</div>
                      <div>
                        <p className="font-semibold text-yellow-800">Pending Approval</p>
                        <p className="text-sm text-yellow-700 mt-1">
                          You have {pkgPurchases.filter(p => !p.approved).length} package purchase{pkgPurchases.filter(p => !p.approved).length > 1 ? 's' : ''} waiting for admin approval.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {pkgPurchases.map(p => {
                    const attempt = getPackageAttempt(p.packageId);
                    
                    return (
                      <div key={p.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-4 flex-wrap sm:flex-nowrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="font-medium text-gray-800 truncate">{p.package?.title ?? p.packageId}</div>
                            {attempt && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium whitespace-nowrap">
                                ✓ Completed
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 flex items-center gap-3 flex-wrap">
                            <span>Purchased {new Date(p.purchasedAt).toLocaleDateString()}</span>
                            {attempt && (
                              <span className="text-blue-600 font-medium">
                                Score: {attempt.score}%
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${p.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {p.approved ? "✓ Active" : "⏳ Pending"}
                          </span>
                          {p.approved && p.package && (
                            attempt ? (
                              <Button 
                                onClick={() => router.push(`/quiz/${p.packageId}/results/${attempt.id}`)}
                                size="sm"
                                variant="outline"
                              >
                                View Results →
                              </Button>
                            ) : (
                              <Button 
                                onClick={() => router.push(`/quiz/${p.packageId}`)}
                                size="sm"
                              >
                                Start Quiz →
                              </Button>
                            )
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Profile */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 lg:sticky lg:top-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  {user?.user.name?.charAt(0).toUpperCase() || user?.user.email?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-800">Profile</h3>
                  <p className="text-xs text-gray-500">Your account</p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="pb-3 border-b border-gray-100">
                  <div className="text-gray-500 text-xs mb-1">Name</div>
                  <div className="font-medium text-gray-800">{user?.user.name ?? '-'}</div>
                </div>
                <div className="pb-3 border-b border-gray-100">
                  <div className="text-gray-500 text-xs mb-1">Email</div>
                  <div className="font-medium text-gray-800 break-words">{user?.user.email ?? '-'}</div>
                </div>
                <div className="pb-3">
                  <div className="text-gray-500 text-xs mb-1">User ID</div>
                  <div className="font-mono text-xs text-gray-600 break-all">{user?.user.id}</div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
                <div className="text-xs text-gray-500 mb-2">Quick Stats</div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Bundles</span>
                  <span className="font-semibold text-blue-600">{purchasedBundles.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Packages</span>
                  <span className="font-semibold text-blue-600">{pkgPurchases.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Quizzes Completed</span>
                  <span className="font-semibold text-green-600">{quizAttempts.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
