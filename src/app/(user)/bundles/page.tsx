"use client";
import { useEffect, useState } from "react";
import { formatIDR } from "@/lib/utils";
import type { Bundle, GetBundlesResponse } from "@/types";
import Button from "@/components/Button";

export default function UserBundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBundles = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/bundles");
        const data: GetBundlesResponse = await res.json();
        setBundles(data.data.filter(b => b.isActive));
      } catch (err) {
        setError("Failed to load bundles");
      } finally {
        setLoading(false);
      }
    };
    fetchBundles();
  }, []);

  if (loading) return <div className="py-16 text-center text-lg">Loading bundles...</div>;
  if (error) return <div className="py-16 text-center text-red-600">{error}</div>;
  if (bundles.length === 0) return <div className="py-16 text-center text-gray-500">No bundles available.</div>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Available Bundles</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bundles.map(bundle => (
          <div key={bundle.id} className="bg-white rounded-lg shadow p-6 flex flex-col gap-3 border hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-blue-800">{bundle.title}</h2>
              <span className="text-lg font-bold text-green-700">{formatIDR(bundle.price)}</span>
            </div>
            {bundle.description && <p className="text-gray-600 text-sm mb-2">{bundle.description}</p>}
            <div className="text-xs text-gray-500 mb-2">Includes {bundle.stats?.packagesCount ?? bundle.bundlePackages?.length ?? 0} packages</div>
            <Button className="w-full mt-auto">View Details</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
