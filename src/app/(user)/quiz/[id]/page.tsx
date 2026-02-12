"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import Button from "@/components/Button";
import RichText from "@/components/RichText";
import api from "@/lib/api";
import type { Package, Question, SubmitQuizAttemptResponse, GetMyAttemptsResponse } from "@/types";
import { saveQuizState, restoreQuizState, clearQuizState, resumeQuizState, type PersistedQuizState } from "@/lib/quizStorage";

interface QuizAnswer {
  questionId: string;
  selectedAnswerId: string | string[] | null;
}

interface QuizState {
  currentIndex: number;
  answers: QuizAnswer[];
  startTime: number;
  timeRemaining: number | null; // in seconds, null if no limit
  markedQuestions: string[]; // Array of question IDs marked for review
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const packageId = params.id as string;

  const [pkg, setPackage] = useState<Package | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  // For OSCE: answers: string[]; else: string
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [isOSCE, setIsOSCE] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [checkingAttempt, setCheckingAttempt] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    checkExistingAttempt();
  }, [packageId]);

  const checkExistingAttempt = async () => {
    try {
      setCheckingAttempt(true);
      // Check if user has already attempted this quiz
      const attemptsResponse = await api.get<GetMyAttemptsResponse>("/api/quiz/attempts/mine");
      const existingAttempt = attemptsResponse.data.find(attempt => attempt.packageId === packageId);
      
      if (existingAttempt) {
        // Redirect to results page if already attempted
        router.push(`/quiz/${packageId}/results/${existingAttempt.id}`);
        return;
      }
      
      // No existing attempt, try to restore from localStorage
      const savedState = restoreQuizState(packageId);
      if (savedState) {
        // Restore saved quiz state
        fetchPackageAndQuestions(savedState);
      } else {
        // Start fresh quiz
        fetchPackageAndQuestions();
      }
    } catch (err: any) {
      console.error("Failed to check existing attempts:", err);
      // If check fails, allow them to proceed
      fetchPackageAndQuestions();
    } finally {
      setCheckingAttempt(false);
    }
  };

  // Timer effect
  useEffect(() => {
    if (!quizState || quizState.timeRemaining === null || isPaused) return;

    const timer = setInterval(() => {
      setQuizState((prev) => {
        if (!prev || prev.timeRemaining === null) return prev;
        
        const newTime = prev.timeRemaining - 1;
        
        // Auto-submit when time runs out
        if (newTime <= 0) {
          handleSubmitQuiz(true);
          return prev;
        }
        
        return { ...prev, timeRemaining: newTime };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizState?.timeRemaining, isPaused]);

  const fetchPackageAndQuestions = async (savedState?: PersistedQuizState) => {
    try {
      setLoading(true);
      const response = await api.get<{ success: boolean; data: Package }>(`/api/packages/${packageId}`);
      
      const packageData = response.data;
      setPackage(packageData);

      // Detect OSCE quiz
      const osce = !!(packageData.title && packageData.title.trim().toUpperCase().startsWith('OSCE'));
      setIsOSCE(osce);

      // Extract questions from package
      const packageQuestions = packageData.packageQuestions || [];
      const sortedQuestions = packageQuestions
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((pq) => pq.question);

      setQuestions(sortedQuestions);

      // Restore saved state or initialize new quiz state
      if (savedState) {
        const resumed = resumeQuizState(savedState);
        setQuizState({
          currentIndex: resumed.currentIndex,
          answers: resumed.answers,
          startTime: resumed.startTime,
          timeRemaining: resumed.timeRemaining,
          markedQuestions: resumed.markedQuestions || [],
        });
        setIsPaused(resumed.isPaused);
      } else {
        // Initialize new quiz state
        const timeLimit = packageData.timeLimit;
        setQuizState({
          currentIndex: 0,
          answers: sortedQuestions.map((q) => ({
            questionId: q.id,
            selectedAnswerId: null,
          })),
          startTime: Date.now(),
          timeRemaining: timeLimit ? timeLimit * 60 : null, // convert minutes to seconds
          markedQuestions: [],
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (questionId: string, answerId: string) => {
    if (!quizState || isPaused) return;
    setQuizState((prev) => {
      if (!prev) return prev;
      const newState = {
        ...prev,
        answers: prev.answers.map((a) => {
          if (a.questionId !== questionId) return a;
          if (!isOSCE) {
            return { ...a, selectedAnswerId: answerId };
          } else {
            // Multi-answer: toggle answerId in array
            const arr = Array.isArray(a.selectedAnswerId) ? a.selectedAnswerId : [];
            if (arr.includes(answerId)) {
              return { ...a, selectedAnswerId: arr.filter((id) => id !== answerId) };
            } else {
              return { ...a, selectedAnswerId: [...arr, answerId] };
            }
          }
        }),
      };
      // Save to localStorage
      saveQuizState({
        packageId,
        currentIndex: newState.currentIndex,
        answers: newState.answers,
        startTime: newState.startTime,
        timeRemaining: newState.timeRemaining,
        isPaused: false,
        markedQuestions: newState.markedQuestions,
      });
      return newState;
    });
  };

  const handleNext = () => {
    if (!quizState || quizState.currentIndex >= questions.length - 1 || isPaused) return;
    const newState = { ...quizState, currentIndex: quizState.currentIndex + 1 };
    setQuizState(newState);
    saveQuizState({
      packageId,
      currentIndex: newState.currentIndex,
      answers: newState.answers,
      startTime: newState.startTime,
      timeRemaining: newState.timeRemaining,
      isPaused: false,
      markedQuestions: newState.markedQuestions,
    });
  };

  const handlePrevious = () => {
    if (!quizState || quizState.currentIndex <= 0 || isPaused) return;
    const newState = { ...quizState, currentIndex: quizState.currentIndex - 1 };
    setQuizState(newState);
    saveQuizState({
      packageId,
      currentIndex: newState.currentIndex,
      answers: newState.answers,
      startTime: newState.startTime,
      timeRemaining: newState.timeRemaining,
      isPaused: false,
      markedQuestions: newState.markedQuestions,
    });
  };

  const handleGoToQuestion = (index: number) => {
    if (!quizState || isPaused) return;
    const newState = { ...quizState, currentIndex: index };
    setQuizState(newState);
    saveQuizState({
      packageId,
      currentIndex: newState.currentIndex,
      answers: newState.answers,
      startTime: newState.startTime,
      timeRemaining: newState.timeRemaining,
      isPaused: false,
      markedQuestions: newState.markedQuestions,
    });
  };

  const handlePauseQuiz = () => {
    if (!quizState) return;
    setIsPaused(true);
    saveQuizState({
      packageId,
      currentIndex: quizState.currentIndex,
      answers: quizState.answers,
      startTime: quizState.startTime,
      timeRemaining: quizState.timeRemaining,
      isPaused: true,
      pausedAt: Date.now(),
      markedQuestions: quizState.markedQuestions,
    });
  };

  const handleResumeQuiz = () => {
    setIsPaused(false);
    if (!quizState) return;
    saveQuizState({
      packageId,
      currentIndex: quizState.currentIndex,
      answers: quizState.answers,
      startTime: quizState.startTime,
      timeRemaining: quizState.timeRemaining,
      isPaused: false,
      markedQuestions: quizState.markedQuestions,
    });
  };

  const handleSubmitQuiz = async (autoSubmit = false) => {
    if (!quizState || !pkg) return;

    if (!autoSubmit) {
      setShowConfirmSubmit(true);
      return;
    }

    setSubmitting(true);

    try {
      const timeSpent = Math.floor((Date.now() - quizState.startTime) / 1000); // in seconds

      // Submit to backend
      const response = await api.post<SubmitQuizAttemptResponse>('/api/quiz/attempts', {
        packageId: pkg.id,
        answers: quizState.answers,
        timeSpent,
        startedAt: new Date(quizState.startTime).toISOString()
      });

      const attemptData = response.data;

      // Clear saved state after successful submission
      clearQuizState();

      // Navigate to results page with attempt ID
      router.push(`/quiz/${packageId}/results/${attemptData.id}`);
    } catch (err: any) {
      console.error('Failed to submit quiz:', err);
      setError(err.message || "Failed to submit quiz");
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getAnsweredCount = () => {
    if (!quizState) return 0;
    return quizState.answers.filter((a) => {
      if (!isOSCE) return a.selectedAnswerId !== null;
      return Array.isArray(a.selectedAnswerId) && a.selectedAnswerId.length > 0;
    }).length;
  };

  const handleToggleMarkQuestion = (questionId: string) => {
    if (!quizState || isPaused) return;
    setQuizState((prev) => {
      if (!prev) return prev;
      const isMarked = prev.markedQuestions.includes(questionId);
      const newMarkedQuestions = isMarked
        ? prev.markedQuestions.filter((id) => id !== questionId)
        : [...prev.markedQuestions, questionId];
      
      const newState = {
        ...prev,
        markedQuestions: newMarkedQuestions,
      };

      // Save to localStorage
      saveQuizState({
        packageId,
        currentIndex: newState.currentIndex,
        answers: newState.answers,
        startTime: newState.startTime,
        timeRemaining: newState.timeRemaining,
        isPaused: false,
        markedQuestions: newMarkedQuestions,
      });

      return newState;
    });
  };

  if (loading || checkingAttempt) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-gray-600">
              {checkingAttempt ? "Checking quiz status..." : "Loading quiz..."}
            </span>
          </div>
        </Card>
      </div>
    );
  }

  if (error || !pkg || !quizState) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 bg-red-50 border-red-200">
          <p className="text-red-600 mb-4">{error || "Failed to load quiz"}</p>
          <Button onClick={() => router.push("/quiz")}>Back to Quizzes</Button>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[quizState.currentIndex];
  const currentAnswer = quizState.answers[quizState.currentIndex];
  const progress = ((quizState.currentIndex + 1) / questions.length) * 100;
  const answeredCount = getAnsweredCount();
  const isCurrentMarked = quizState.markedQuestions.includes(currentQuestion.id);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Pause Overlay */}
      {isPaused && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <Card className="p-8 max-w-md w-full text-center">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Paused</h2>
              <p className="text-gray-600">
                Your progress has been saved. You can refresh the page or close your browser, and your answers will be preserved.
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Progress saved:</strong>
                <br />
                {answeredCount} of {questions.length} questions answered
                <br />
                Currently on Question {quizState.currentIndex + 1}
                {quizState.markedQuestions.length > 0 && (
                  <>
                    <br />
                    {quizState.markedQuestions.length} question{quizState.markedQuestions.length > 1 ? 's' : ''} marked for review
                  </>
                )}
              </p>
            </div>
            <Button onClick={handleResumeQuiz} className="w-full">
              Resume Quiz
            </Button>
          </Card>
        </div>
      )}
      
      {/* Header */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pkg.title}</h1>
            <p className="text-sm text-gray-600 mt-1">
              Question {quizState.currentIndex + 1} of {questions.length}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Pause/Resume Button */}
            <Button
              variant="outline"
              onClick={isPaused ? handleResumeQuiz : handlePauseQuiz}
              className="flex items-center gap-2"
            >
              {isPaused ? (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Resume
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                  Pause
                </>
              )}
            </Button>

            {/* Timer */}
            {quizState.timeRemaining !== null && (
              <div className={`text-right ${quizState.timeRemaining < 60 ? 'text-red-600' : 'text-gray-900'}`}>
                <div className="text-sm font-medium">Time Remaining</div>
                <div className={`text-2xl font-bold ${quizState.timeRemaining < 60 ? 'animate-pulse' : ''}`}>
                  {formatTime(quizState.timeRemaining)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-2 text-sm text-gray-600">
          {answeredCount} of {questions.length} questions answered
        </div>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        {/* Left: Question Card */}
        <div className="lg:col-span-3">
          <Card className="p-8">
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex-1">
                  <RichText html={currentQuestion.text} />
                </h2>
                <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full flex-shrink-0">
                  Q{quizState.currentIndex + 1}
                </span>
              </div>

              {currentQuestion.imageUrl && (
                <div className="mb-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentQuestion.imageUrl}
                    alt="Question"
                    className="max-h-96 rounded-lg border-2 border-gray-200 mx-auto"
                  />
                </div>
              )}

              {/* Mark for Review Button */}
              <div className="mb-4">
                <button
                  onClick={() => handleToggleMarkQuestion(currentQuestion.id)}
                  disabled={isPaused}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isPaused
                      ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-600"
                      : isCurrentMarked
                      ? "bg-yellow-100 text-yellow-800 border-2 border-yellow-400 hover:bg-yellow-200"
                      : "bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill={isCurrentMarked ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                    />
                  </svg>
                  {isCurrentMarked ? "Marked for Review" : "Mark for Review"}
                </button>
              </div>
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQuestion.answers.map((answer, index) => {
                let checked = false;
                if (!isOSCE) {
                  checked = currentAnswer.selectedAnswerId === answer.id;
                } else {
                  checked = Array.isArray(currentAnswer.selectedAnswerId) && currentAnswer.selectedAnswerId.includes(answer.id);
                }
                return (
                  <label
                    key={answer.id}
                    className={`flex items-center p-4 border-2 rounded-lg transition-all ${
                      isPaused
                        ? "opacity-50 cursor-not-allowed border-gray-200 bg-gray-50"
                        : checked
                        ? "border-blue-500 bg-blue-50 cursor-pointer"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer"
                    }`}
                  >
                    <input
                      type={isOSCE ? "checkbox" : "radio"}
                      name={`question-${currentQuestion.id}`}
                      value={answer.id}
                      checked={checked}
                      onChange={() => handleSelectAnswer(currentQuestion.id, answer.id)}
                      disabled={isPaused}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 disabled:opacity-50"
                    />
                    <div className="ml-4 flex items-center flex-1">
                      <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium mr-3 flex-shrink-0">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <RichText className="text-gray-900" html={answer.text} />
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={quizState.currentIndex === 0 || isPaused}
              >
                ← Previous
              </Button>

              {quizState.currentIndex < questions.length - 1 ? (
                <Button onClick={handleNext} disabled={isPaused}>Next →</Button>
              ) : (
                <Button
                  onClick={() => handleSubmitQuiz(false)}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={submitting || isPaused}
                >
                  {submitting ? "Submitting..." : "Submit Quiz"}
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Right: Question Navigator Panel */}
        <div className="lg:col-span-1">
          <Card className="p-6 lg:sticky lg:top-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Questions</h3>
            
            {/* Question Grid */}
            <div className="grid grid-cols-5 lg:grid-cols-4 gap-2 mb-6">
              {questions.map((question, index) => {
                const answered = quizState.answers[index].selectedAnswerId !== null;
                const isCurrent = index === quizState.currentIndex;
                const isMarked = quizState.markedQuestions.includes(question.id);

                return (
                  <button
                    key={index}
                    onClick={() => handleGoToQuestion(index)}
                    disabled={isPaused}
                    className={`relative aspect-square rounded-lg text-sm font-medium transition-all ${
                      isPaused
                        ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-700"
                        : isCurrent
                        ? "bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-2"
                        : answered
                        ? "bg-green-100 text-green-700 border-2 border-green-300 hover:bg-green-200"
                        : "bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    {index + 1}
                    {/* Mark indicator - yellow flag */}
                    {isMarked && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border-2 border-white"></span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-blue-600"></div>
                <span className="text-gray-600">Current</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-green-100 border-2 border-green-300"></div>
                <span className="text-gray-600">Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-gray-100 border-2 border-gray-300"></div>
                <span className="text-gray-600">Unanswered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-6 h-6 rounded bg-gray-100 border-2 border-gray-300">
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border-2 border-white"></span>
                </div>
                <span className="text-gray-600">Marked</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Confirm Submit Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Submit Quiz?</h3>
            <p className="text-gray-600 mb-2">
              You have answered {answeredCount} out of {questions.length} questions.
            </p>
            {answeredCount < questions.length && (
              <p className="text-orange-600 text-sm mb-4">
                You have {questions.length - answeredCount} unanswered question(s). These will be marked as incorrect.
              </p>
            )}
            <p className="text-gray-600 mb-6">
              Are you sure you want to submit your quiz? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmSubmit(false)}
                className="flex-1"
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowConfirmSubmit(false);
                  handleSubmitQuiz(true);
                }}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
