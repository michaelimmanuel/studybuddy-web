// types/referral.ts

export type DiscountType = 'PERCENTAGE' | 'FIXED';

export interface ReferralCode {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  quota: number;
  usedCount: number;
  remainingUses: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  createdBy: string;
  creator?: {
    name: string;
    email: string;
  };
}

export interface CreateReferralCodeInput {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  quota: number;
  expiresAt: string; // ISO date string
}

export interface UpdateReferralCodeInput {
  discountType?: DiscountType;
  discountValue?: number;
  quota?: number;
  isActive?: boolean;
  expiresAt?: string | null;
}

export interface ValidateReferralCodeResponse {
  valid: boolean;
  referralCode?: ReferralCode;
  message?: string;
}

export interface ReferralCodesListResponse {
  referralCodes: ReferralCode[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Purchase types with referral code support
export interface PackagePurchaseInput {
  packageId: string;
  proofImageUrl: string;
  referralCode?: string; // Optional referral code
}

export interface BundlePurchaseInput {
  bundleId: string;
  proofImageUrl: string;
  referralCode?: string; // Optional referral code
}

export interface Purchase {
  id: string;
  userId: string;
  pricePaid: number;
  originalPrice: number;
  discountApplied: number;
  referralCodeId?: string;
  status: 'pending' | 'approved' | 'rejected';
  proofImageUrl?: string;
  createdAt: string;
}
