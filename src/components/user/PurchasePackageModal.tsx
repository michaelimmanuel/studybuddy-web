"use client";

import { useState } from "react";
import Modal from "@/components/admin/modals/Modal";
import Button from "@/components/Button";
import ImageUpload from "@/components/ImageUpload";
import api from "@/lib/api";

interface PurchasePackageModalProps {
  open: boolean;
  onClose: () => void;
  packageId: string | null;
  packageTitle?: string;
}

export default function PurchasePackageModal({ open, onClose, packageId, packageTitle }: PurchasePackageModalProps) {
  const [proofImageUrl, setProofImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!packageId) return;
    if (!proofImageUrl) {
      setError("Please upload a transaction proof image");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await api.post("/api/purchases/package", { packageId, proofImageUrl });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || "Failed to submit purchase request");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setProofImageUrl("");
    setError(null);
    setSuccess(false);
    onClose();
  };

  return (
    <Modal isOpen={open} onClose={handleClose} title={packageTitle ? `Purchase: ${packageTitle}` : "Purchase Package"}>
      <div className="space-y-4">
        {!success && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
            Upload a clear screenshot or photo of your payment transaction as proof. An admin will review and approve your access.
          </div>
        )}

        {!success && (
          <ImageUpload
            onUploadComplete={setProofImageUrl}
            onUploadError={(err) => setError(err)}
            currentImageUrl={proofImageUrl}
            folder="payment-proofs"
            label="Transaction Proof"
            buttonText="Upload Payment Proof"
            maxSizeMB={5}
          />
        )}

        {error && <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-3">{error}</div>}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-green-800">
            <p className="font-semibold">Purchase request submitted successfully!</p>
            <p className="mt-1">Please wait for admin approval. You'll be able to access the content once your payment is confirmed.</p>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          {!success ? (
            <>
              <Button variant="outline" onClick={handleClose} disabled={loading}>Cancel</Button>
              <Button className="bg-blue-600 text-white" onClick={handleSubmit} loading={loading}>
                Submit Request
              </Button>
            </>
          ) : (
            <Button className="bg-green-600 text-white" onClick={handleClose}>Close</Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
