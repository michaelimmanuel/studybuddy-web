// app/admin/referral-codes/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { referralCodeService } from '@/services/referralCodeService';
import CreateReferralCodeModal from '@/components/admin/CreateReferralCodeModal';
import Button from '@/components/Button';
import type { ReferralCode } from '@/types/referral';

export default function ReferralCodesManagementPage() {
  const [codes, setCodes] = useState<ReferralCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCodes = async () => {
    try {
      setLoading(true);
      const response = await referralCodeService.list({
        page,
        limit: 20,
        isActive: filter === 'all' ? undefined : filter === 'active'
      });
      setCodes(response.referralCodes);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Failed to fetch referral codes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, [page, filter]);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await referralCodeService.update(id, { isActive: !currentStatus });
      fetchCodes();
    } catch (error) {
      alert('Failed to update referral code');
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Delete referral code "${code}"?`)) return;
    
    try {
      await referralCodeService.delete(id);
      fetchCodes();
    } catch (error) {
      alert('Failed to delete referral code');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No expiration';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDiscount = (code: ReferralCode) => {
    return code.discountType === 'PERCENTAGE'
      ? `${code.discountValue}%`
      : `Rp ${code.discountValue.toLocaleString()}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Referral Codes Management</h1>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white"
        >
          Create New Code
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'active', 'inactive'] as const).map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => {
              setFilter(filterOption);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg capitalize ${
              filter === filterOption
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {filterOption}
          </button>
        ))}
      </div>

      {/* Codes Table */}
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : codes.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No referral codes found
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Discount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Expires
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {codes.map((code) => (
                  <tr key={code.id}>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-lg">
                        {code.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-green-600 font-semibold">
                        {formatDiscount(code)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium">
                          {code.usedCount} / {code.quota}
                        </div>
                        <div className="text-gray-500">
                          {code.remainingUses} remaining
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          code.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {code.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(code.expiresAt)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <button
                        onClick={() => handleToggleActive(code.id, code.isActive)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        {code.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(code.id, code.code)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <CreateReferralCodeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchCodes}
      />
    </div>
  );
}
