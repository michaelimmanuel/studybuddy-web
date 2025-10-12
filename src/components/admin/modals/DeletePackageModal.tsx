"use client";

import { useState } from "react";
import Modal from "./Modal";
import Button from "@/components/Button";
import api from "@/lib/api";
import { formatIDR } from "@/lib/utils";
import type { Package, DeletePackageResponse } from "@/types";

interface DeletePackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  package: Package;
}

export default function DeletePackageModal({ isOpen, onClose, onSuccess, package: pkg }: DeletePackageModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState("");

  const handleDelete = async () => {
    if (confirmText !== pkg.title) {
      setError("Package title doesn't match");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.del<DeletePackageResponse>(`/api/packages/${pkg.id}`);
      onSuccess();
    } catch (err: any) {
      setError(err.data?.message || "Failed to delete package");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setConfirmText("");
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
        type="button"
        onClick={handleDelete}
        loading={loading}
        disabled={confirmText !== pkg.title}
        className="bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-300"
      >
        Delete Package
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Delete Package"
      footer={footer}
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-600">{error}</div>
          </div>
        )}

        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Warning: This action cannot be undone
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  You are about to permanently delete this package and all its associations with questions.
                  This will remove:
                </p>
                <ul className="list-disc list-inside mt-2">
                  <li>The package: <strong>{pkg.title}</strong></li>
                  <li>All question associations ({pkg.packageQuestions?.length || 0} questions)</li>
                  <li>Package configuration and settings</li>
                </ul>
                <p className="mt-2">
                  <strong>Note:</strong> The questions themselves will not be deleted, only their association with this package.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="confirm-title" className="block text-sm font-medium text-gray-700 mb-2">
            To confirm deletion, type the package title: <strong>{pkg.title}</strong>
          </label>
          <input
            type="text"
            id="confirm-title"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            placeholder="Type package title to confirm"
            disabled={loading}
          />
          {confirmText && confirmText !== pkg.title && (
            <p className="text-xs text-red-600 mt-1">
              Title doesn't match
            </p>
          )}
          {confirmText === pkg.title && (
            <p className="text-xs text-green-600 mt-1">
              Title confirmed
            </p>
          )}
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
          <div className="text-sm text-gray-700">
            <strong>Package Details:</strong>
            <br />
            <strong>ID:</strong> {pkg.id}
            <br />
            <strong>Price:</strong> {formatIDR(pkg.price)}
            <br />
            <strong>Status:</strong> {pkg.isActive ? "Active" : "Inactive"}
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