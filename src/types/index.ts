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

// Quiz Types (matching API documentation)
export interface QuizAnswer {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  text: string;
  answers: QuizAnswer[];
}

// Form types for creating quizzes (before API assigns IDs)
export interface QuizAnswerForm {
  id?: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestionForm {
  id?: string;
  text: string;
  answers: QuizAnswerForm[];
}

export interface Quiz {
  id: string;
  title: string;
  timeLimit: number;
  createdAt: string;
  course?: {
    id: string;
    title: string;
  };
  questions?: QuizQuestion[];
  questionCount?: number;
  submissionCount?: number;
  userSubmission?: {
    id: string;
    score: number;
    submittedAt: string;
  } | null;
}

// API Response Types
export interface GetCourseQuizzesResponse {
  course: {
    id: string;
    title: string;
  };
  quizzes: {
    id: string;
    title: string;
    timeLimit: number;
    createdAt: string;
    questionCount: number;
    submissionCount: number;
    userSubmission?: {
      id: string;
      score: number;
      submittedAt: string;
    } | null;
  }[];
}

export interface GetQuizByIdResponse {
  quiz: {
    id: string;
    title: string;
    timeLimit: number;
    createdAt: string;
    course: {
      id: string;
      title: string;
    };
    questions: QuizQuestion[];
    userSubmission: {
      id: string;
      score: number;
      submittedAt: string;
    } | null;
  };
}

export interface CreateQuizRequest {
  courseId: string;
  title: string;
  timeLimit: number;
  questions: {
    text: string;
    answers: {
      text: string;
      isCorrect: boolean;
    }[];
  }[];
}

export interface CreateQuizResponse {
  message: string;
  quiz: {
    id: string;
    title: string;
    timeLimit: number;
    createdAt: string;
    course: {
      id: string;
      title: string;
    };
    questions: QuizQuestion[];
  };
}

export interface UpdateQuizRequest {
  title?: string;
  timeLimit?: number;
}

export interface UpdateQuizResponse {
  message: string;
  quiz: {
    id: string;
    title: string;
    timeLimit: number;
    updatedAt: string;
  };
}

export interface GetQuizDetailResponse {
  quiz: {
    id: string;
    title: string;
    timeLimit: number;
    createdAt: string;
    updatedAt: string;
    course: {
      id: string;
      title: string;
    };
    questions: QuizQuestion[];
  };
}

export interface SubmitQuizRequest {
  answers: {
    questionId: string;
    answerId: string;
  }[];
}

export interface SubmitQuizResponse {
  message: string;
  submission: {
    id: string;
    score: number;
    submittedAt: string;
    correctAnswers: number;
    totalQuestions: number;
  };
}

export interface GetQuizSubmissionsResponse {
  quiz: {
    id: string;
    title: string;
    course: {
      id: string;
      title: string;
    };
  };
  submissions: {
    id: string;
    score: number;
    submittedAt: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }[];
  stats: {
    totalSubmissions: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
  };
}

// Legacy types for compatibility
export interface QuizSubmission {
  id: string;
  score: number;
  submittedAt: string;
  correctAnswers: number;
  totalQuestions: number;
}

export interface CourseQuizzesResponse extends GetCourseQuizzesResponse {}