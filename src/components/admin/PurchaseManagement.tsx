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
}

interface BundlePurchase {
  id: string;
  user: UserInfo;
  bundle: BundleInfo;
  pricePaid: number;
  purchasedAt: string;
  expiresAt?: string;
  approved: boolean;
}

export default function AdminPurchaseManagement() {
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState<PackagePurchase[]>([]);
  const [bundles, setBundles] = useState<BundlePurchase[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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
        await api.delete(`/api/purchases/admin/${type}/${id}`);
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
      <h1 className="text-2xl font-bold mb-6">Purchase Management</h1>
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
                  <th className="p-2 border">Approved</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {packages.map((p) => (
                  <tr key={p.id} className={p.approved ? "" : "bg-yellow-50"}>
                    <td className="p-2 border">{p.user.name} <br /><span className="text-xs text-gray-500">{p.user.email}</span></td>
                    <td className="p-2 border">{p.package.title}</td>
                    <td className="p-2 border">{p.pricePaid}</td>
                    <td className="p-2 border">{new Date(p.purchasedAt).toLocaleString()}</td>
                    <td className="p-2 border">{p.approved ? "Yes" : "No"}</td>
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
                  <th className="p-2 border">Approved</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bundles.map((b) => (
                  <tr key={b.id} className={b.approved ? "" : "bg-yellow-50"}>
                    <td className="p-2 border">{b.user.name} <br /><span className="text-xs text-gray-500">{b.user.email}</span></td>
                    <td className="p-2 border">{b.bundle.title}</td>
                    <td className="p-2 border">{b.pricePaid}</td>
                    <td className="p-2 border">{new Date(b.purchasedAt).toLocaleString()}</td>
                    <td className="p-2 border">{b.approved ? "Yes" : "No"}</td>
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
        </>
      )}
    </div>
  );
}
