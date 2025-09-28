// API Response Types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: string | null;
  banned: boolean;
  createdAt: string;
}

export interface UserStats {
  totalUsers: number;
  verifiedUsers: number;
  bannedUsers: number;
  adminUsers: number;
  recentUsers: number;
  verificationRate: string;
}

// Course Types
export interface Course {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  enrollmentCount: number;
  isEnrolled?: boolean;
}

export interface CourseStats {
  totalCourses: number;
  totalEnrollments: number;
  approvedEnrollments: number;
  pendingEnrollments: number;
  rejectedEnrollments: number;
  averageEnrollmentsPerCourse: string;
}

export interface PopularCourse {
  id: string;
  title: string;
  enrollmentCount: number;
}

export interface CourseStatsResponse {
  stats: CourseStats;
  popularCourses: PopularCourse[];
}

// Pagination Types
export interface PaginationMeta {
  page: number;
  limit: number;
  totalPages: number;
  totalCourses?: number;
  totalUsers?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// Form Types
export interface CourseFormData {
  title: string;
  description: string;
}

export interface CreateCourseRequest extends CourseFormData {}
export interface UpdateCourseRequest extends CourseFormData {}