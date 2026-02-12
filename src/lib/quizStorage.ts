/**
 * Quiz State Persistence Utilities
 * Handles saving and restoring quiz state from localStorage
 */

export interface QuizAnswer {
  questionId: string;
  selectedAnswerId: string | string[] | null;
}

export interface PersistedQuizState {
  packageId: string;
  currentIndex: number;
  answers: QuizAnswer[];
  startTime: number;
  timeRemaining: number | null;
  isPaused: boolean;
  pausedAt?: number;
  markedQuestions?: string[]; // Array of question IDs marked for review
}

const QUIZ_STORAGE_KEY = "studybuddy_quiz_state";

/**
 * Save quiz state to localStorage
 */
export function saveQuizState(state: PersistedQuizState): void {
  try {
    localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save quiz state:", error);
  }
}

/**
 * Restore quiz state from localStorage for a specific package
 */
export function restoreQuizState(packageId: string): PersistedQuizState | null {
  try {
    const stored = localStorage.getItem(QUIZ_STORAGE_KEY);
    if (!stored) return null;

    const state: PersistedQuizState = JSON.parse(stored);
    
    // Only return state if it matches the current package
    if (state.packageId !== packageId) return null;
    
    return state;
  } catch (error) {
    console.error("Failed to restore quiz state:", error);
    return null;
  }
}

/**
 * Clear quiz state from localStorage
 */
export function clearQuizState(): void {
  try {
    localStorage.removeItem(QUIZ_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear quiz state:", error);
  }
}

/**
 * Update time remaining when resuming from pause
 */
export function resumeQuizState(state: PersistedQuizState): PersistedQuizState {
  if (!state.isPaused || !state.pausedAt || state.timeRemaining === null) {
    return { ...state, isPaused: false };
  }

  // Time already paused, so just resume without deducting more time
  return {
    ...state,
    isPaused: false,
    pausedAt: undefined,
  };
}
