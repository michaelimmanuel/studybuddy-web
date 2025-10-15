"use client";
import Modal from "./Modal";
import Button from "@/components/Button";
import api from "@/lib/api";
import type { Bundle } from "@/types";
import { useState } from "react";

interface DeleteBundleModalProps {
  open: boolean;
  onClose: () => void;
  bundle: Bundle;
  onSuccess: () => void;
}

export default function DeleteBundleModal({ open, onClose, bundle, onSuccess }: DeleteBundleModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.del(`/api/bundles/${bundle.id}`);
      if (res.success) {
        onSuccess();
      } else {
        setError((res as any).message || "Failed to delete bundle");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to delete bundle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose} title="Delete Bundle">
      <div className="space-y-4">
        <p>Are you sure you want to delete the bundle <b>{bundle.title}</b>? This action cannot be undone.</p>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <div className="flex justify-end space-x-2">
          <Button type="button" onClick={onClose} disabled={loading} variant="secondary">
            Cancel
          </Button>
          <Button type="button" onClick={handleDelete} loading={loading} variant="outline" className="!bg-red-100 !text-red-700 hover:!bg-red-200">
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}
