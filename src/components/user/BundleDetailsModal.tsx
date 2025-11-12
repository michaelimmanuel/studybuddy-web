"use client";
import Modal from "@/components/admin/modals/Modal";
import Button from "@/components/Button";
import ImageUpload from "@/components/ImageUpload";
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
  const [proofImageUrl, setProofImageUrl] = useState<string>("");

  if (!bundle) return null;

  const handlePurchase = async () => {
    if (!proofImageUrl) {
      setError("Please upload a transaction proof image");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await api.post("/api/purchases/bundle", { 
        bundleId: bundle.id,
        proofImageUrl 
      });
      setSuccess(true);
      // Show the message from server about approval requirement
      if (response?.message) {
        setError(null); // Clear any previous errors
      }
    } catch (err: any) {
      setError(err?.message || "Failed to purchase bundle");
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    if (!loading) {
      setProofImageUrl("");
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  return (
    <Modal isOpen={open} onClose={handleModalClose} title={bundle.title}>
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

        {!success && (
          <div className="border-t pt-4">
            <ImageUpload
              onUploadComplete={setProofImageUrl}
              onUploadError={(err) => setError(err)}
              currentImageUrl={proofImageUrl}
              folder="payment-proofs"
              label="Transaction Proof"
              buttonText="Upload Payment Proof"
              maxSizeMB={5}
            />
          </div>
        )}

        {error && <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-3">{error}</div>}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-green-800">
            <p className="font-semibold">Purchase request submitted successfully!</p>
            <p className="mt-1">Please wait for admin approval. You'll be able to access the content once your payment is confirmed.</p>
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          {!success && (
            <>
              <Button variant="outline" onClick={handleModalClose} disabled={loading}>
                Cancel
              </Button>
              <Button className="bg-blue-600 text-white" onClick={handlePurchase} loading={loading}>
                Submit Purchase Request
              </Button>
            </>
          )}
          {success && (
            <Button className="bg-green-600 text-white" onClick={handleModalClose}>
              Close
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
