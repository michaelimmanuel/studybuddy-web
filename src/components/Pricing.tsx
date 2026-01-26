'use client';

import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Check, Package } from 'lucide-react';
import api from '@/lib/api';
import { formatIDR } from '@/lib/currency';
import type { Bundle } from '@/types';
import { useRouter } from 'next/navigation';

export function Pricing() {
  const router = useRouter();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBundles();
  }, []);

  const loadBundles = async () => {
    try {
      const resp = await api.get<{ success: boolean; data: Bundle[] }>("/api/bundles");
      // Only show active bundles to regular users
      const activeBundles = resp.data.filter(b => b.isActive);
      setBundles(activeBundles);
    } catch (err: any) {
      console.error('Failed to load bundles:', err);
      // If 401, bundles might require auth or server is down - fail silently
      if (err?.status === 401) {
        setBundles([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBundleClick = (bundleId: string) => {
    // Check if user is logged in
    api.get('/api/users/me')
      .then(() => {
        // User is logged in, redirect to bundle detail page
        router.push(`/bundles/${bundleId}`);
      })
      .catch(() => {
        // User not logged in, redirect to login
        router.push('/login');
      });
  };

  if (loading) {
    return (
      <section className="relative py-32 px-8">
        <div className="max-w-screen-2xl mx-auto text-center">
          <div className="text-gray-400">Loading pricing...</div>
        </div>
      </section>
    );
  }

  if (bundles.length === 0) {
    return null; // Don't show section if no bundles
  }

  return (
    <section id="pricing" className="relative py-32 px-8">
      <div className="max-w-screen-2xl mx-auto">
        <motion.div
          className="text-center mb-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-6xl md:text-8xl font-bold mb-6">
            <span className="block">Choose Your</span>
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Plan
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Get access to premium study materials and ace your dental exams
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {bundles.map((bundle, index) => {
            const packagesCount = bundle.stats?.packagesCount ?? bundle.bundlePackages?.length ?? 0;
            const totalQuestions = bundle.stats?.totalQuestions ?? 0;
            const savings = bundle.stats?.savingsPercentage ?? 0;
            const hasSavings = savings > 0;

            return (
              <motion.div
                key={bundle.id}
                className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden hover:border-white/30 transition-all duration-500"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
              >
                {/* Savings Badge */}
                {hasSavings && (
                  <div className="absolute top-6 right-6 z-20">
                    <div className="bg-gradient-to-r from-green-400 to-emerald-400 text-black font-bold px-4 py-2 rounded-full text-sm shadow-lg">
                      Save {savings.toFixed(0)}%
                    </div>
                  </div>
                )}

                {/* Gradient Background on Hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />

                <div className="relative z-10 p-8">
                  {/* Header */}
                  <div className="mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl flex items-center justify-center mb-6">
                      <Package className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold mb-3">{bundle.title}</h3>
                    {bundle.description && (
                      <p className="text-gray-400 line-clamp-2">{bundle.description}</p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                      {formatIDR(bundle.price)}
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 text-gray-300">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span>{packagesCount} Premium Package{packagesCount !== 1 ? 's' : ''}</span>
                    </div>
                    {totalQuestions > 0 && (
                      <div className="flex items-center gap-3 text-gray-300">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span>{totalQuestions.toLocaleString()} Practice Questions</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-gray-300">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span>Detailed Explanations</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span>Progress Tracking</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <motion.button
                    onClick={() => handleBundleClick(bundle.id)}
                    className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-cyan-500/50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Get Started
                  </motion.button>
                </div>

                {/* Decorative Corner */}
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-white/10 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
