"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { formatIDR } from "@/lib/utils";
import type { Bundle, GetBundlesResponse } from "@/types";
import Button from "@/components/Button";

import BundleDetailsModal from "@/components/user/BundleDetailsModal";

export default function UserBundlesPage() {

  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);

  useEffect(() => {
    api.get<GetBundlesResponse>("/api/bundles")
      .then(res => setBundles(res.data.filter(b => b.isActive)))
      .catch(() => setError("Failed to load bundles"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-16 text-center text-lg">Loading bundles...</div>;
  if (error) return <div className="py-16 text-center text-red-600">{error}</div>;
  if (bundles.length === 0) return <div className="py-16 text-center text-gray-500">No bundles available.</div>;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Available Bundles</h1>
      <div className="grid gap-6">
        {bundles.map(bundle => (
          <div key={bundle.id} className="rounded-lg border shadow p-6 bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="text-xl font-semibold text-gray-900">{bundle.title}</div>
              {bundle.description && <div className="text-gray-600 mt-1 text-sm">{bundle.description}</div>}
              <div className="mt-2 text-xs text-gray-500">{bundle.stats?.packagesCount ?? bundle.bundlePackages?.length ?? 0} packages included</div>
            </div>
            <div className="flex flex-col items-end gap-2 min-w-[120px]">
              <div className="text-lg font-bold text-blue-700">{formatIDR(bundle.price)}</div>
              <Button className="w-full" onClick={() => setSelectedBundle(bundle)}>View Details</Button>
            </div>
          </div>
        ))}
      </div>
      <BundleDetailsModal open={!!selectedBundle} onClose={() => setSelectedBundle(null)} bundle={selectedBundle} />
    </div>
  );
}
