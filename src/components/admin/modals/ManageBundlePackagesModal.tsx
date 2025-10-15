"use client";
import { useState, useEffect } from "react";
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
      // Add
      for (const pkgId of toAdd) {
        await api.post(`/api/bundles/${bundle.id}/add-package`, { packageId: pkgId });
      }
      // Remove
      for (const pkgId of toRemove) {
        await api.post(`/api/bundles/${bundle.id}/remove-package`, { packageId: pkgId });
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
      <div className="space-y-4">
        <div>
          <div className="font-medium mb-2">Select packages to include in this bundle:</div>
          <div className="max-h-64 overflow-y-auto border rounded p-2 bg-gray-50">
            {allPackages.length === 0 ? (
              <div className="text-gray-500 text-sm">No packages found.</div>
            ) : (
              allPackages.map(pkg => (
                <label key={pkg.id} className="flex items-center space-x-2 py-1">
                  <input
                    type="checkbox"
                    checked={selected.includes(pkg.id)}
                    onChange={() => handleToggle(pkg.id)}
                  />
                  <span>{pkg.title}</span>
                </label>
              ))
            )}
          </div>
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <div className="flex justify-end space-x-2">
          <Button type="button" onClick={onClose} disabled={loading} variant="secondary">
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} loading={loading}>
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
}
