"use client";

import { useState } from "react";
import Modal from "@/components/admin/modals/Modal";
import Button from "@/components/Button";
import ImageUpload from "@/components/ImageUpload";
import ReferralCodeInput from "@/components/user/ReferralCodeInput";
import api from "@/lib/api";
import type { ReferralCode } from "@/types/referral";

interface PurchasePackageModalProps {
  open: boolean;
  onClose: () => void;
  packageId: string | null;
  packageTitle?: string;
  packagePrice?: number;
}

export default function PurchasePackageModal({ open, onClose, packageId, packageTitle, packagePrice = 0 }: PurchasePackageModalProps) {
  const [proofImageUrl, setProofImageUrl] = useState<string>("");
  const [appliedCode, setAppliedCode] = useState<ReferralCode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const calculateFinalPrice = (): number => {
    if (!appliedCode) return packagePrice;

    if (appliedCode.discountType === 'PERCENTAGE') {
      const discount = (packagePrice * appliedCode.discountValue) / 100;
      return packagePrice - Math.round(discount);
    }
    
    return Math.max(0, packagePrice - appliedCode.discountValue);
  };

  const handleSubmit = async () => {
    if (!packageId) return;
    if (!proofImageUrl) {
      setError("Please upload a transaction proof image");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const purchaseData: any = { packageId, proofImageUrl };
      if (appliedCode) {
        purchaseData.referralCode = appliedCode.code;
      }
      await api.post("/api/purchases/package", purchaseData);
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
    setAppliedCode(null);
    setError(null);
    setSuccess(false);
    onClose();
  };

  const finalPrice = calculateFinalPrice();
  const hasSavings = appliedCode && finalPrice < packagePrice;

  return (
    <Modal isOpen={open} onClose={handleClose} title={packageTitle ? `Purchase: ${packageTitle}` : "Purchase Package"}>
      <div className="space-y-4">
        {!success && packagePrice > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-1">
              {hasSavings ? (
                <>
                  <div className="flex justify-between text-gray-600">
                    <span>Original Price:</span>
                    <span className="line-through">Rp {packagePrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>Discount:</span>
                    <span>- Rp {(packagePrice - finalPrice).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold pt-2 border-t">
                    <span>Final Price:</span>
                    <span className="text-green-600">Rp {finalPrice.toLocaleString()}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-xl font-bold">
                  <span>Price:</span>
                  <span>Rp {packagePrice.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {!success && packagePrice > 0 && (
          <ReferralCodeInput
            onCodeApplied={setAppliedCode}
            onCodeRemoved={() => setAppliedCode(null)}
            originalPrice={packagePrice}
          />
        )}

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
