"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal";
import Button from "@/components/Button";
import api from "@/lib/api";
import type { Package, PackageForm, UpdatePackageResponse } from "@/types";

interface EditPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  package: Package;
}

export default function EditPackageModal({ isOpen, onClose, onSuccess, package: pkg }: EditPackageModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<PackageForm & { isActive: boolean }>({
    title: "",
    description: "",
    price: 0,
    isActive: true,
  });

  useEffect(() => {
    if (pkg) {
      setFormData({
        title: pkg.title,
        description: pkg.description || "",
        price: pkg.price,
        isActive: pkg.isActive,
      });
    }
  }, [pkg]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.put<UpdatePackageResponse>(`/api/packages/${pkg.id}`, formData);
      onSuccess();
    } catch (err: any) {
      setError(err.data?.message || "Failed to update package");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
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
        Update Package
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Package"
      footer={footer}
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-600">{error}</div>
          </div>
        )}

        <div>
          <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-2">
            Package Title *
          </label>
          <input
            type="text"
            id="edit-title"
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
          <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="edit-description"
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
          <label htmlFor="edit-price" className="block text-sm font-medium text-gray-700 mb-2">
            Price (IDR) *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">Rp</span>
            <input
              type="number"
              id="edit-price"
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

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              disabled={loading}
            />
            <span className="ml-2 text-sm text-gray-700">Package is active</span>
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Only active packages will be visible to users
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="text-sm text-yellow-800">
            <strong>Package ID:</strong> {pkg.id}
            <br />
            <strong>Questions:</strong> {pkg.packageQuestions?.length || 0}
            <br />
            <strong>Created:</strong> {new Date(pkg.createdAt).toLocaleString()}
          </div>
        </div>
      </div>
    </Modal>
  );
}