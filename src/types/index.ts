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

// Core Course type used across admin UI
export interface Course {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  // Some views show this; not always returned
  enrollmentCount?: number;
  isEnrolled?: boolean;
  userEnrollment?: {
    status: string;
  };
  enrolledUsers?: Array<{
    id: string;
    name: string;
    email: string;
    image?: string;
    enrolledAt: string;
  }>;
}

// API Response for questionBanks list
export interface GetAllQuestionBanksResponse {
  questionBanks: QuestionBank[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalQuestionBanks: number;
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
export interface QuestionBank {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  // Add any other fields relevant to question banks
}

// API Response for course detail
export interface GetCourseByIdResponse {
  course: Course;
}

export interface GetAllCoursesResponse {
  courses: Course[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalCourses: number;
  };
}

export interface UpdateCourseResponse {
  success: boolean;
  message: string;
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
export interface QuestionBankFormData {
  title: string;
  description: string;
}

export interface CreateQuestionBankRequest extends QuestionBankFormData {}
export interface UpdateQuestionBankRequest extends QuestionBankFormData {}

// API Response Types for Course Operations  
export interface CreateQuestionBankResponse {
  questionBank: QuestionBank;
}

export interface UpdateQuestionBankResponse {
  questionBank: QuestionBank;
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
  imageUrl?: string; // Optional image associated with the question
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
  imageUrl?: string; // Optional image URL
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
  imageUrl?: string; // Optional image URL
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
  imageUrl?: string; // Optional image URL
}

// Package Types
export interface Package {
  id: string;
  title: string;
  description?: string;
  price: number;
  isActive: boolean;
  timeLimit?: number; // Time limit in minutes
  availableFrom?: string; // ISO string
  availableUntil?: string; // ISO string
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
  timeLimit?: number; // Time limit in minutes
  availableFrom?: string; // ISO string or empty string
  availableUntil?: string; // ISO string or empty string
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

export interface AddRandomQuestionsFromCourseResponse {
  success: boolean;
  message: string;
  data: {
    packageId: string;
    courseId: string;
    requested: number;
    added: number;
    remainingAvailable: number;
  };
}

// Bundle Types
export interface BundlePackageRef {
  id: string;
  packageId: string;
  order?: number;
  package: Package;
}

export interface BundleStats {
  totalOriginalPrice: number;
  totalQuestions: number;
  savings: number;
  savingsPercentage: number;
  packagesCount: number;
}

export interface Bundle {
  id: string;
  title: string;
  description?: string;
  price: number;
  discount?: number | null;
  isActive: boolean;
  availableFrom?: string;
  availableUntil?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  bundlePackages?: BundlePackageRef[];
  stats?: BundleStats;
}

export interface BundleForm {
  title: string;
  description?: string;
  price: number;
  discount?: number | null;
  availableFrom?: string; // ISO or empty
  availableUntil?: string; // ISO or empty
  packageIds: string[]; // selected packages to add after creation
}

// Purchase Types
export interface PackagePurchase {
  id: string;
  userId: string;
  packageId: string;
  pricePaid: number;
  purchasedAt: string;
  expiresAt?: string | null;
  package?: { id: string; title: string; price: number };
}

export interface BundlePurchase {
  id: string;
  userId: string;
  bundleId: string;
  pricePaid: number;
  purchasedAt: string;
  expiresAt?: string | null;
  bundle?: { id: string; title: string; price: number };
}

export interface GetBundlesResponse { success: boolean; data: Bundle[]; }
export interface GetBundleByIdResponse { success: boolean; data: Bundle; }

export interface PurchasePackageResponse { success: boolean; message: string; data: PackagePurchase; }
export interface PurchaseBundleResponse { success: boolean; message: string; data: BundlePurchase; }
export interface GetMyPurchasesResponse { success: boolean; data: { packages: PackagePurchase[]; bundles: BundlePurchase[] } }
export interface CheckPackageAccessResponse { success: boolean; data: { packageId: string; hasAccess: boolean } }

// Quiz Attempt Types
export interface QuizAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  selectedAnswerId: string | null;
  isCorrect: boolean;
  createdAt: string;
  question?: Question;
  selectedAnswer?: Answer;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  packageId: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  startedAt: string;
  completedAt: string;
  createdAt: string;
  answers?: QuizAnswer[];
  package?: {
    id: string;
    title: string;
    description?: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface SubmitQuizAttemptRequest {
  packageId: string;
  answers: {
    questionId: string;
    selectedAnswerId: string | null;
  }[];
  timeSpent: number;
  startedAt: string;
}

export interface SubmitQuizAttemptResponse {
  success: boolean;
  message: string;
  data: QuizAttempt;
}

export interface GetMyAttemptsResponse {
  success: boolean;
  data: QuizAttempt[];
}

export interface GetAttemptByIdResponse {
  success: boolean;
  data: QuizAttempt;
}

export interface AdminGetAllAttemptsResponse {
  success: boolean;
  data: {
    attempts: QuizAttempt[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
    };
  };
}

export interface AdminGetQuizStatsResponse {
  success: boolean;
  data: {
    totalAttempts: number;
    averageScore: number;
    averageTimeSpent: number;
    passRate: number;
    passedCount: number;
  };
}
