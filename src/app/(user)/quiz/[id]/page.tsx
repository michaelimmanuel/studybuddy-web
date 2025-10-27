"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import Button from "@/components/Button";
import api from "@/lib/api";
import type { Package, Question, SubmitQuizAttemptResponse, GetMyAttemptsResponse } from "@/types";

interface QuizAnswer {
  questionId: string;
  selectedAnswerId: string | null;
}

interface QuizState {
  currentIndex: number;
  answers: QuizAnswer[];
  startTime: number;
  timeRemaining: number | null; // in seconds, null if no limit
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const packageId = params.id as string;

  const [pkg, setPackage] = useState<Package | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [checkingAttempt, setCheckingAttempt] = useState(true);

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
      
      // No existing attempt, load quiz
      fetchPackageAndQuestions();
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
    if (!quizState || quizState.timeRemaining === null) return;

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
  }, [quizState?.timeRemaining]);

  const fetchPackageAndQuestions = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ success: boolean; data: Package }>(`/api/packages/${packageId}`);
      
      const packageData = response.data;
      setPackage(packageData);

      // Extract questions from package
      const packageQuestions = packageData.packageQuestions || [];
      const sortedQuestions = packageQuestions
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((pq) => pq.question);

      setQuestions(sortedQuestions);

      // Initialize quiz state
      const timeLimit = packageData.timeLimit;
      setQuizState({
        currentIndex: 0,
        answers: sortedQuestions.map((q) => ({
          questionId: q.id,
          selectedAnswerId: null,
        })),
        startTime: Date.now(),
        timeRemaining: timeLimit ? timeLimit * 60 : null, // convert minutes to seconds
      });
    } catch (err: any) {
      setError(err.message || "Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (questionId: string, answerId: string) => {
    if (!quizState) return;

    setQuizState({
      ...quizState,
      answers: quizState.answers.map((a) =>
        a.questionId === questionId ? { ...a, selectedAnswerId: answerId } : a
      ),
    });
  };

  const handleNext = () => {
    if (!quizState || quizState.currentIndex >= questions.length - 1) return;
    setQuizState({ ...quizState, currentIndex: quizState.currentIndex + 1 });
  };

  const handlePrevious = () => {
    if (!quizState || quizState.currentIndex <= 0) return;
    setQuizState({ ...quizState, currentIndex: quizState.currentIndex - 1 });
  };

  const handleGoToQuestion = (index: number) => {
    if (!quizState) return;
    setQuizState({ ...quizState, currentIndex: index });
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
    return quizState.answers.filter((a) => a.selectedAnswerId !== null).length;
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pkg.title}</h1>
            <p className="text-sm text-gray-600 mt-1">
              Question {quizState.currentIndex + 1} of {questions.length}
            </p>
          </div>

          {quizState.timeRemaining !== null && (
            <div className={`text-right ${quizState.timeRemaining < 60 ? 'text-red-600' : 'text-gray-900'}`}>
              <div className="text-sm font-medium">Time Remaining</div>
              <div className={`text-2xl font-bold ${quizState.timeRemaining < 60 ? 'animate-pulse' : ''}`}>
                {formatTime(quizState.timeRemaining)}
              </div>
            </div>
          )}
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
                  {currentQuestion.text}
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
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQuestion.answers.map((answer, index) => (
                <label
                  key={answer.id}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    currentAnswer.selectedAnswerId === answer.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={answer.id}
                    checked={currentAnswer.selectedAnswerId === answer.id}
                    onChange={() => handleSelectAnswer(currentQuestion.id, answer.id)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div className="ml-4 flex items-center flex-1">
                    <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium mr-3 flex-shrink-0">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-gray-900">{answer.text}</span>
                  </div>
                </label>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={quizState.currentIndex === 0}
              >
                ← Previous
              </Button>

              {quizState.currentIndex < questions.length - 1 ? (
                <Button onClick={handleNext}>Next →</Button>
              ) : (
                <Button
                  onClick={() => handleSubmitQuiz(false)}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={submitting}
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
              {questions.map((_, index) => {
                const answered = quizState.answers[index].selectedAnswerId !== null;
                const isCurrent = index === quizState.currentIndex;

                return (
                  <button
                    key={index}
                    onClick={() => handleGoToQuestion(index)}
                    className={`aspect-square rounded-lg text-sm font-medium transition-all ${
                      isCurrent
                        ? "bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-2"
                        : answered
                        ? "bg-green-100 text-green-700 border-2 border-green-300 hover:bg-green-200"
                        : "bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    {index + 1}
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
