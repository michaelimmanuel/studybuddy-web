// services/referralCodeService.ts

import { api } from '@/lib/api';
import type {
  ReferralCode,
  CreateReferralCodeInput,
  UpdateReferralCodeInput,
  ValidateReferralCodeResponse,
  ReferralCodesListResponse
} from '@/types/referral';

export const referralCodeService = {
  // PUBLIC: Validate a referral code
  validate: async (code: string): Promise<ValidateReferralCodeResponse> => {
    return api.post('/api/referral-codes/validate', { code });
  },

  // ADMIN: List all referral codes
  list: async (params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  }): Promise<ReferralCodesListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.isActive !== undefined) {
      queryParams.append('isActive', params.isActive.toString());
    }
    
    const query = queryParams.toString();
    return api.get(`/api/referral-codes${query ? `?${query}` : ''}`);
  },

  // ADMIN: Get referral code by ID
  getById: async (id: string): Promise<ReferralCode> => {
    return api.get(`/api/referral-codes/${id}`);
  },

  // ADMIN: Create new referral code
  create: async (data: CreateReferralCodeInput): Promise<ReferralCode> => {
    return api.post('/api/referral-codes', data);
  },

  // ADMIN: Update referral code
  update: async (
    id: string,
    data: UpdateReferralCodeInput
  ): Promise<ReferralCode> => {
    return api.put(`/api/referral-codes/${id}`, data);
  },

  // ADMIN: Delete referral code
  delete: async (id: string): Promise<{ message: string }> => {
    return api.del(`/api/referral-codes/${id}`);
  }
};
