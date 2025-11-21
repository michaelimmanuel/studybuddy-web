// components/user/ReferralCodeInput.tsx
'use client';

import { useState } from 'react';
import { referralCodeService } from '@/services/referralCodeService';
import type { ReferralCode } from '@/types/referral';

interface ReferralCodeInputProps {
  onCodeApplied: (code: ReferralCode) => void;
  onCodeRemoved: () => void;
  originalPrice: number;
}

export default function ReferralCodeInput({
  onCodeApplied,
  onCodeRemoved,
  originalPrice
}: ReferralCodeInputProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [appliedCode, setAppliedCode] = useState<ReferralCode | null>(null);

  const handleValidate = async () => {
    if (!code.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await referralCodeService.validate(code.toUpperCase());
      
      if (response.valid && response.referralCode) {
        setAppliedCode(response.referralCode);
        onCodeApplied(response.referralCode);
        setError('');
      } else {
        setError(response.message || 'Invalid referral code');
        setAppliedCode(null);
      }
    } catch (err: any) {
      setError('Failed to validate code');
      setAppliedCode(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setCode('');
    setAppliedCode(null);
    setError('');
    onCodeRemoved();
  };

  const calculateDiscount = (referralCode: ReferralCode): number => {
    if (referralCode.discountType === 'PERCENTAGE') {
      return Math.round((originalPrice * referralCode.discountValue) / 100);
    }
    return Math.min(referralCode.discountValue, originalPrice);
  };

  const calculateFinalPrice = (referralCode: ReferralCode): number => {
    return originalPrice - calculateDiscount(referralCode);
  };

  if (appliedCode) {
    const discount = calculateDiscount(appliedCode);
    const finalPrice = calculateFinalPrice(appliedCode);

    return (
      <div className="border-2 border-green-500 rounded-lg p-4 bg-green-50">
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-bold">✓ Code Applied</span>
              <span className="font-mono font-bold text-lg">{appliedCode.code}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {appliedCode.discountType === 'PERCENTAGE' 
                ? `${appliedCode.discountValue}% discount` 
                : `Rp ${appliedCode.discountValue.toLocaleString()} discount`}
            </p>
          </div>
          <button
            onClick={handleRemove}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Remove
          </button>
        </div>
        
        <div className="space-y-1 text-sm mt-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Original Price:</span>
            <span className="line-through">Rp {originalPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-green-600 font-semibold">
            <span>Discount:</span>
            <span>- Rp {discount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span>Final Price:</span>
            <span className="text-green-600">Rp {finalPrice.toLocaleString()}</span>
          </div>
        </div>

        {appliedCode.remainingUses <= 10 && (
          <p className="text-xs text-orange-600 mt-2">
            ⚠️ Only {appliedCode.remainingUses} uses remaining
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4">
      <label className="block text-sm font-medium mb-2">
        Have a referral code?
      </label>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError('');
          }}
          placeholder="Enter code"
          className="flex-1 px-3 py-2 border rounded-lg uppercase"
          disabled={loading}
        />
        <button
          onClick={handleValidate}
          disabled={loading || !code.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Checking...' : 'Apply'}
        </button>
      </div>

      {error && (
        <p className="text-red-600 text-sm mt-2">
          {error}
        </p>
      )}
    </div>
  );
}
