"use client";
import Modal from "@/components/admin/modals/Modal";
import Button from "@/components/Button";
import ImageUpload from "@/components/ImageUpload";
import ReferralCodeInput from "@/components/user/ReferralCodeInput";
import { formatIDR } from "@/lib/utils";
import type { Bundle } from "@/types";
import type { ReferralCode } from "@/types/referral";
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
  const [appliedCode, setAppliedCode] = useState<ReferralCode | null>(null);

  if (!bundle) return null;

  const calculateFinalPrice = (): number => {
    if (!appliedCode) return bundle.price;

    if (appliedCode.discountType === 'PERCENTAGE') {
      const discount = (bundle.price * appliedCode.discountValue) / 100;
      return bundle.price - Math.round(discount);
    }
    
    return Math.max(0, bundle.price - appliedCode.discountValue);
  };

  const handlePurchase = async () => {
    if (!proofImageUrl) {
      setError("Please upload a transaction proof image");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const purchaseData: any = { 
        bundleId: bundle.id,
        proofImageUrl 
      };
      if (appliedCode) {
        purchaseData.referralCode = appliedCode.code;
      }
      const response = await api.post("/api/purchases/bundle", purchaseData);
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
      setAppliedCode(null);
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  return (
    <Modal isOpen={open} onClose={handleModalClose} title={bundle.title}>
      <div className="space-y-4">
        <div className="text-gray-700 text-base">{bundle.description}</div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="space-y-1">
            {appliedCode && calculateFinalPrice() < bundle.price ? (
              <>
                <div className="flex justify-between text-gray-600">
                  <span>Original Price:</span>
                  <span className="line-through">{formatIDR(bundle.price)}</span>
                </div>
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Discount:</span>
                  <span>- {formatIDR(bundle.price - calculateFinalPrice())}</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-2 border-t">
                  <span>Final Price:</span>
                  <span className="text-green-600">{formatIDR(calculateFinalPrice())}</span>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between">
                <div className="text-xl font-bold text-blue-700">{formatIDR(bundle.price)}</div>
                {bundle.discount && (
                  <span className="text-sm text-green-600 font-semibold">{bundle.discount}% off</span>
                )}
              </div>
            )}
          </div>
        </div>

        {!success && (
          <ReferralCodeInput
            onCodeApplied={setAppliedCode}
            onCodeRemoved={() => setAppliedCode(null)}
            originalPrice={bundle.price}
          />
        )}

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
          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
            <h3 className="font-semibold text-blue-900 mb-3">Payment Instructions:</h3>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/img/QR.jpg" 
                  alt="Payment QR Code" 
                  className="w-48 h-48 object-contain border-2 border-gray-300 rounded-lg bg-white"
                />
              </div>
              <div className="flex-1 text-sm text-gray-700">
                <ol className="list-decimal list-inside space-y-2">
                  <li>Scan the QR code or transfer to the account shown</li>
                  <li>Transfer amount: <strong>{formatIDR(calculateFinalPrice())}</strong></li>
                  <li>Take a screenshot of your payment confirmation</li>
                  <li>Upload the proof below</li>
                  <li>Wait for admin approval (within 24 hours)</li>
                </ol>
              </div>
            </div>
          </div>
        )}

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
