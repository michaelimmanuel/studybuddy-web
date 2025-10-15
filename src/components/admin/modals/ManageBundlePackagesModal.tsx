"use client";
import { useState, useEffect } from "react";
import { FaBoxOpen, FaCheckCircle, FaRegCircle } from "react-icons/fa";
import { formatIDR } from "@/lib/utils";
import Modal from "./Modal";
import Button from "@/components/Button";
import api from "@/lib/api";
import type { Bundle, Package } from "@/types";

interface ManageBundlePackagesModalProps {
  open: boolean;
  onClose: () => void;
  bundle: Bundle;
  onSuccess: () => void;
}

export default function ManageBundlePackagesModal({ open, onClose, bundle, onSuccess }: ManageBundlePackagesModalProps) {
  const [allPackages, setAllPackages] = useState<Package[]>([]);
  const [selected, setSelected] = useState<string[]>(bundle.bundlePackages?.map(bp => bp.packageId) || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      api.get<{ data: Package[] }>("/api/packages").then(res => setAllPackages(res.data)).catch(() => setAllPackages([]));
      setSelected(bundle.bundlePackages?.map(bp => bp.packageId) || []);
    }
  }, [open, bundle]);

  const handleToggle = (pkgId: string) => {
    setSelected(sel => sel.includes(pkgId) ? sel.filter(id => id !== pkgId) : [...sel, pkgId]);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      // Find packages to add and remove
      const current = bundle.bundlePackages?.map(bp => bp.packageId) || [];
      const toAdd = selected.filter(id => !current.includes(id));
      const toRemove = current.filter(id => !selected.includes(id));
      // Use batch endpoints that the server exposes
      if (toAdd.length > 0) {
        await api.post(`/api/bundles/${bundle.id}/packages`, { packageIds: toAdd });
      }
      if (toRemove.length > 0) {
        await api.del(`/api/bundles/${bundle.id}/packages`, { packageIds: toRemove });
      }
      onSuccess();
    } catch (err: any) {
      setError(err?.message || "Failed to update packages");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose} title="Manage Bundle Packages">
      <div className="space-y-6">
        <div>
          <div className="font-semibold mb-3 text-gray-800 text-base flex items-center gap-2">
            <FaBoxOpen className="text-blue-400" /> Select packages to include in this bundle:
          </div>
          <div className="max-h-72 overflow-y-auto border rounded-lg p-2 bg-gradient-to-br from-blue-50 to-white shadow-inner">
            {allPackages.length === 0 ? (
              <div className="text-gray-500 text-sm text-center py-8">No packages found.</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {allPackages.map(pkg => {
                  const checked = selected.includes(pkg.id);
                  return (
                    <li key={pkg.id} className={`flex items-center gap-3 py-3 px-2 rounded-lg transition hover:bg-blue-50 ${checked ? "bg-blue-50/60" : ""}`}>
                      <button
                        type="button"
                        aria-label={checked ? "Deselect" : "Select"}
                        onClick={() => handleToggle(pkg.id)}
                        className="focus:outline-none"
                      >
                        {checked ? (
                          <FaCheckCircle className="text-blue-600 text-xl" />
                        ) : (
                          <FaRegCircle className="text-gray-400 text-xl" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                          <FaBoxOpen className="text-blue-300" /> {pkg.title}
                        </div>
                        {pkg.description && (
                          <div className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{pkg.description}</div>
                        )}
                      </div>
                      <div className="text-xs text-gray-700 font-semibold bg-blue-100 px-2 py-0.5 rounded-full">
                        {pkg.price ? formatIDR(pkg.price) : "Free"}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" onClick={onClose} disabled={loading} variant="secondary">
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} loading={loading} className="bg-blue-600 text-white">
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
}
