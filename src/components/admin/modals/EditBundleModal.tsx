"use client";
import { useState } from "react";
import Modal from "./Modal";
import Button from "@/components/Button";
import api from "@/lib/api";
import type { Bundle } from "@/types";

interface EditBundleModalProps {
  open: boolean;
  onClose: () => void;
  bundle: Bundle;
  onSuccess: () => void;
}

export default function EditBundleModal({ open, onClose, bundle, onSuccess }: EditBundleModalProps) {
  const [title, setTitle] = useState(bundle.title);
  const [description, setDescription] = useState(bundle.description || "");
  const [price, setPrice] = useState(bundle.price);
  const [discount, setDiscount] = useState<number | undefined>(bundle.discount ?? undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.put(`/api/bundles/${bundle.id}`,
        { title, description, price, discount }
      );
      if (res.success) {
        onSuccess();
      } else {
        setError((res as any).message || "Failed to update bundle");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to update bundle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose} title="Edit Bundle">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Price</label>
          <input
            type="number"
            className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
            value={price}
            onChange={e => setPrice(Number(e.target.value))}
            min={0}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Discount (%)</label>
          <input
            type="number"
            className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
            value={discount ?? ""}
            onChange={e => setDiscount(e.target.value ? Number(e.target.value) : undefined)}
            min={0}
            max={100}
          />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <div className="flex justify-end space-x-2">
          <Button type="button" onClick={onClose} disabled={loading} variant="secondary">
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}
