// components/admin/CreateReferralCodeModal.tsx
'use client';

import { useState } from 'react';
import { referralCodeService } from '@/services/referralCodeService';
import type { DiscountType } from '@/types/referral';
import Modal from './modals/Modal';
import Button from '@/components/Button';

interface CreateReferralCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateReferralCodeModal({
  isOpen,
  onClose,
  onSuccess
}: CreateReferralCodeModalProps) {
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE' as DiscountType,
    discountValue: 10,
    quota: 100,
    expiresAt: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await referralCodeService.create(formData);
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        code: '',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        quota: 100,
        expiresAt: ''
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create referral code');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Referral Code">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Code Input */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Code *
          </label>
          <input
            type="text"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            placeholder="SAVE20"
            className="w-full px-3 py-2 border rounded-lg"
            required
            minLength={3}
            maxLength={20}
            pattern="[A-Z0-9_-]+"
          />
          <p className="text-xs text-gray-500 mt-1">
            3-20 characters, uppercase letters, numbers, underscores, hyphens
          </p>
        </div>

        {/* Discount Type */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Discount Type *
          </label>
          <select
            value={formData.discountType}
            onChange={(e) => setFormData({ 
              ...formData, 
              discountType: e.target.value as DiscountType,
              discountValue: e.target.value === 'PERCENTAGE' ? 10 : 25000
            })}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="PERCENTAGE">Percentage (%)</option>
            <option value="FIXED_AMOUNT">Fixed Amount (IDR)</option>
          </select>
        </div>

        {/* Discount Value */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Discount Value *
          </label>
          <input
            type="number"
            value={formData.discountValue}
            onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
            className="w-full px-3 py-2 border rounded-lg"
            required
            min={formData.discountType === 'PERCENTAGE' ? 1 : 1000}
            max={formData.discountType === 'PERCENTAGE' ? 100 : undefined}
            step={formData.discountType === 'PERCENTAGE' ? 1 : 1000}
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.discountType === 'PERCENTAGE' 
              ? '1-100% discount' 
              : 'Fixed amount in IDR'}
          </p>
        </div>

        {/* Quota */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Usage Quota *
          </label>
          <input
            type="number"
            value={formData.quota}
            onChange={(e) => setFormData({ ...formData, quota: Number(e.target.value) })}
            className="w-full px-3 py-2 border rounded-lg"
            required
            min={1}
          />
          <p className="text-xs text-gray-500 mt-1">
            Maximum number of times this code can be used
          </p>
        </div>

        {/* Expiration Date */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Expiration Date *
          </label>
          <input
            type="datetime-local"
            value={formData.expiresAt}
            onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
            min={new Date().toISOString().slice(0, 16)}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            loading={loading}
            className="flex-1 bg-blue-600 text-white"
          >
            Create Code
          </Button>
        </div>
      </form>
    </Modal>
  );
}
