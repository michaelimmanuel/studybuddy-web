"use client";

import { useState } from "react";
import Modal from "./Modal";
import Button from "@/components/Button";
import api from "@/lib/api";
import type { PackageForm, CreatePackageResponse } from "@/types";

interface CreatePackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreatePackageModal({ isOpen, onClose, onSuccess }: CreatePackageModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<PackageForm>({
    title: "",
    description: "",
    price: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post<CreatePackageResponse>("/api/packages", formData);
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        price: 0,
      });
      
      onSuccess();
    } catch (err: any) {
      setError(err.data?.message || "Failed to create package");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        title: "",
        description: "",
        price: 0,
      });
      setError(null);
      onClose();
    }
  };

  const footer = (
    <div className="flex justify-end space-x-3">
      <Button
        type="button"
        variant="outline"
        onClick={handleClose}
        disabled={loading}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        onClick={handleSubmit}
        loading={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        Create Package
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Package"
      footer={footer}
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-600">{error}</div>
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Package Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter package title"
            required
            maxLength={200}
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Maximum 200 characters ({formData.title.length}/200)
          </p>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter package description (optional)"
            rows={4}
            maxLength={1000}
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Maximum 1000 characters ({formData.description?.length || 0}/1000)
          </p>
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
            Price (IDR) *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">Rp</span>
            <input
              type="number"
              id="price"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
              min="0"
              step="1000"
              required
              disabled={loading}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Enter the price in Indonesian Rupiah (e.g., 299000)
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="text-sm text-blue-800">
            <strong>Note:</strong> After creating the package, you can add questions to it from the package management page.
          </div>
        </div>
      </div>
    </Modal>
  );
}