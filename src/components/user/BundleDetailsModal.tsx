"use client";
import Modal from "@/components/admin/modals/Modal";
import Button from "@/components/Button";
import { formatIDR } from "@/lib/utils";
import type { Bundle } from "@/types";
import api from "@/lib/api";
import { useState } from "react";


interface BundleDetailsModalProps {
  open: boolean;
  onClose: () => void;
  bundle: Bundle | null;
}

export default function BundleDetailsModal({ open, onClose, bundle }: BundleDetailsModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!bundle) return null;

  const handlePurchase = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await api.post("/api/purchases/bundle", { bundleId: bundle.id });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || "Failed to purchase bundle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose} title={bundle.title}>
      <div className="space-y-4">
        <div className="text-gray-700 text-base">{bundle.description}</div>
        <div className="flex items-center gap-4">
          <div className="text-lg font-bold text-blue-700">{formatIDR(bundle.price)}</div>
          {bundle.discount && (
            <span className="text-sm text-green-600 font-semibold">{bundle.discount}% off</span>
          )}
        </div>
        <div>
          <div className="font-semibold mb-1">Included Packages:</div>
          <ul className="list-disc pl-5 text-gray-800 text-sm">
            {bundle.bundlePackages && bundle.bundlePackages.length > 0 ? (
              bundle.bundlePackages.map(bp => (
                <li key={bp.id}>{bp.package?.title || bp.packageId}</li>
              ))
            ) : (
              <li className="text-gray-400">No packages in this bundle.</li>
            )}
          </ul>
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">Purchase successful!</div>}
        <div className="flex justify-end pt-2">
          <Button className="bg-blue-600 text-white" onClick={handlePurchase} loading={loading} disabled={success}>
            {success ? "Purchased" : "Purchase Bundle"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
