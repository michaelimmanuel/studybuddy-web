// API Response Types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

// API Response for course detail
export interface GetCourseByIdResponse {
  course: Course;
}

// API Response for courses list
export interface GetAllCoursesResponse {
  courses: Course[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalCourses: number;
  };
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
// Course Types (matching API documentation exactly)
export interface Course {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  enrollmentCount: number;
  isEnrolled?: boolean; // For list endpoint
  // Additional fields from course detail API
  userEnrollment?: {
    status: string;
    enrolledAt: string;
  };
  enrolledUsers?: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    enrolledAt: string;
  }[];
}

// API Response for course detail
export interface GetCourseByIdResponse {
  course: Course;
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

// API Response Types for Course Operations  
export interface CreateCourseResponse {
  course: Course;
}

export interface UpdateCourseResponse {
  course: Course;
}

// Question Types (question-based architecture)
export interface Answer {
  id: string;
  text: string;
  isCorrect?: boolean; // Only visible to admins
}

export interface Question {
  id: string;
  text: string;
  createdAt: string;
  courseId?: string;
  answers: Answer[];
  explanation?: string; // Single explanation per question, only visible to admins
  course?: {
    id: string;
    title: string;
  };
}

// Question API Response Types
export interface GetCourseQuestionsResponse {
  course: {
    id: string;
    title: string;
  };
  questions: Question[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetAllQuestionsResponse {
  questions: Question[];
}

export interface CreateQuestionRequest {
  text: string;
  answers: {
    text: string;
    isCorrect: boolean;
  }[];
  explanation?: string; // Single explanation per question (0-1000 characters)
}

export interface CreateQuestionResponse {
  message: string;
  question: Question;
}

export interface UpdateQuestionRequest {
  text?: string;
  answers?: {
    text: string;
    isCorrect: boolean;
  }[];
  explanation?: string; // Single explanation per question (0-1000 characters)
}

export interface UpdateQuestionResponse {
  message: string;
  question: Question;
}

export interface GetQuestionStatsResponse {
  stats: {
    totalQuestions: number;
    questionsWithMultipleCorrectAnswers: number;
    averageAnswersPerQuestion: number;
    questionsCreatedThisWeek: number;
    questionsCreatedThisMonth: number;
  };
}

// Form types for creating questions
export interface AnswerForm {
  text: string;
  isCorrect: boolean;
}

export interface QuestionForm {
  text: string;
  answers: AnswerForm[];
  explanation?: string; // Single explanation per question
}

// Package Types
export interface Package {
  id: string;
  title: string;
  description?: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  packageQuestions?: PackageQuestion[];
}

export interface PackageQuestion {
  id: string;
  packageId: string;
  questionId: string;
  order?: number;
  createdAt: string;
  question: Question;
}

export interface PackageForm {
  title: string;
  description?: string;
  price: number;
}

export interface AddQuestionsToPackageRequest {
  questionIds: string[];
}

export interface RemoveQuestionsFromPackageRequest {
  questionIds: string[];
}

// API Response Types for Packages
export interface GetPackagesResponse {
  success: boolean;
  data: Package[];
}

export interface GetPackageByIdResponse {
  success: boolean;
  data: Package;
}

export interface CreatePackageResponse {
  success: boolean;
  message: string;
  data: Package;
}

export interface UpdatePackageResponse {
  success: boolean;
  message: string;
  data: Package;
}

export interface DeletePackageResponse {
  success: boolean;
  message: string;
}

export interface AddQuestionsToPackageResponse {
  success: boolean;
  message: string;
  data: {
    packageId: string;
    questionsAdded: number;
    duplicatesSkipped: number;
  };
}

export interface RemoveQuestionsFromPackageResponse {
  success: boolean;
  message: string;
  data: {
    packageId: string;
    questionsRemoved: number;
  };
}