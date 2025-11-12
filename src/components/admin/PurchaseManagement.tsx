"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import Button from "@/components/Button";

interface UserInfo {
  id: string;
  name: string;
  email: string;
}

interface PackageInfo {
  id: string;
  title: string;
  price: number;
}

interface BundleInfo {
  id: string;
  title: string;
  price: number;
}

interface PackagePurchase {
  id: string;
  user: UserInfo;
  package: PackageInfo;
  pricePaid: number;
  purchasedAt: string;
  expiresAt?: string;
  approved: boolean;
  proofImageUrl?: string | null;
}

interface BundlePurchase {
  id: string;
  user: UserInfo;
  bundle: BundleInfo;
  pricePaid: number;
  purchasedAt: string;
  expiresAt?: string;
  approved: boolean;
  proofImageUrl?: string | null;
}

export default function AdminPurchaseManagement() {
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState<PackagePurchase[]>([]);
  const [bundles, setBundles] = useState<BundlePurchase[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [viewingProof, setViewingProof] = useState<string | null>(null);

  const fetchPurchases = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/purchases/admin/all");
      setPackages(res.data.packages);
      setBundles(res.data.bundles);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch purchases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const handleAction = async (type: "package" | "bundle", id: string, action: "approve" | "revoke" | "delete") => {
    setActionLoading(`${type}-${id}-${action}`);
    try {
      if (action === "delete") {
        await api.del(`/api/purchases/admin/${type}/${id}`);
      } else {
        await api.post(`/api/purchases/admin/${type}/${id}/${action}`);
      }
      await fetchPurchases();
    } catch (err: any) {
      setError(err?.message || `Failed to ${action} purchase`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Purchase Management</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded ${filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-200'}`}
          >
            Pending ({[...packages, ...bundles].filter(p => !p.approved).length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded ${filter === 'approved' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
          >
            Approved
          </button>
        </div>
      </div>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <h2 className="text-xl font-semibold mt-4 mb-2">Package Purchases</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">User</th>
                  <th className="p-2 border">Package</th>
                  <th className="p-2 border">Price Paid</th>
                  <th className="p-2 border">Purchased At</th>
                  <th className="p-2 border">Proof</th>
                  <th className="p-2 border">Approved</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {packages
                  .filter(p => filter === 'all' || (filter === 'pending' && !p.approved) || (filter === 'approved' && p.approved))
                  .map((p) => (
                  <tr key={p.id} className={p.approved ? "" : "bg-yellow-50"}>
                    <td className="p-2 border">{p.user.name} <br /><span className="text-xs text-gray-500">{p.user.email}</span></td>
                    <td className="p-2 border">{p.package.title}</td>
                    <td className="p-2 border">{p.pricePaid}</td>
                    <td className="p-2 border">{new Date(p.purchasedAt).toLocaleString()}</td>
                    <td className="p-2 border text-center">
                      {p.proofImageUrl ? (
                        <button
                          onClick={() => setViewingProof(p.proofImageUrl!)}
                          className="text-blue-600 hover:text-blue-800 underline text-xs"
                        >View</button>
                      ) : (
                        <span className="text-gray-400 text-xs">None</span>
                      )}
                    </td>
                    <td className="p-2 border">
                      {p.approved ? (
                        <span className="text-green-600 font-semibold">✓ Approved</span>
                      ) : (
                        <span className="text-yellow-600 font-semibold">⏳ Pending</span>
                      )}
                    </td>
                    <td className="p-2 border space-x-1">
                      <Button size="sm" disabled={actionLoading === `package-${p.id}-approve` || p.approved} onClick={() => handleAction("package", p.id, "approve")}>Approve</Button>
                      <Button size="sm" disabled={actionLoading === `package-${p.id}-revoke` || !p.approved} onClick={() => handleAction("package", p.id, "revoke")} variant="secondary">Revoke</Button>
                      <Button size="sm" disabled={actionLoading === `package-${p.id}-delete`} onClick={() => handleAction("package", p.id, "delete")} variant="outline">Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="text-xl font-semibold mt-8 mb-2">Bundle Purchases</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">User</th>
                  <th className="p-2 border">Bundle</th>
                  <th className="p-2 border">Price Paid</th>
                  <th className="p-2 border">Purchased At</th>
                  <th className="p-2 border">Proof</th>
                  <th className="p-2 border">Approved</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bundles
                  .filter(b => filter === 'all' || (filter === 'pending' && !b.approved) || (filter === 'approved' && b.approved))
                  .map((b) => (
                  <tr key={b.id} className={b.approved ? "" : "bg-yellow-50"}>
                    <td className="p-2 border">{b.user.name} <br /><span className="text-xs text-gray-500">{b.user.email}</span></td>
                    <td className="p-2 border">{b.bundle.title}</td>
                    <td className="p-2 border">{b.pricePaid}</td>
                    <td className="p-2 border">{new Date(b.purchasedAt).toLocaleString()}</td>
                    <td className="p-2 border text-center">
                      {b.proofImageUrl ? (
                        <button
                          onClick={() => setViewingProof(b.proofImageUrl!)}
                          className="text-blue-600 hover:text-blue-800 underline text-xs"
                        >View</button>
                      ) : (
                        <span className="text-gray-400 text-xs">None</span>
                      )}
                    </td>
                    <td className="p-2 border">
                      {b.approved ? (
                        <span className="text-green-600 font-semibold">✓ Approved</span>
                      ) : (
                        <span className="text-yellow-600 font-semibold">⏳ Pending</span>
                      )}
                    </td>
                    <td className="p-2 border space-x-1">
                      <Button size="sm" disabled={actionLoading === `bundle-${b.id}-approve` || b.approved} onClick={() => handleAction("bundle", b.id, "approve")}>Approve</Button>
                      <Button size="sm" disabled={actionLoading === `bundle-${b.id}-revoke` || !b.approved} onClick={() => handleAction("bundle", b.id, "revoke")} variant="secondary">Revoke</Button>
                      <Button size="sm" disabled={actionLoading === `bundle-${b.id}-delete`} onClick={() => handleAction("bundle", b.id, "delete")} variant="outline">Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {viewingProof && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setViewingProof(null)}>
              <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-4 relative" onClick={e => e.stopPropagation()}>
                <button
                  className="absolute top-2 right-2 bg-gray-200 hover:bg-gray-300 rounded-full p-2"
                  onClick={() => setViewingProof(null)}
                  aria-label="Close"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <h3 className="text-lg font-semibold mb-3">Transaction Proof</h3>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={viewingProof} alt="Transaction Proof" className="w-full h-auto rounded border" />
                <div className="mt-4 flex justify-end">
                  <a
                    href={viewingProof}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >Open Original</a>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
