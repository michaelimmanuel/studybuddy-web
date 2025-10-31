"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import Button from "@/components/Button";
import api from "@/lib/api";
import type { GetAttemptByIdResponse, QuizAttempt } from "@/types";
import RichText from "@/components/RichText";

export default function QuizResultsPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;
  const packageId = params.id as string;

  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    fetchAttemptDetails();
  }, [attemptId]);

  const fetchAttemptDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get<GetAttemptByIdResponse>(`/api/quiz/attempts/${attemptId}`);
      setAttempt(response.data);
    } catch (err: any) {
      console.error("Failed to load attempt details:", err);
      setError(err.message || "Failed to load results");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-50 border-green-200";
    if (score >= 60) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  const getScoreMessage = (score: number) => {
    if (score >= 90) return "Excellent! Outstanding performance! 🌟";
    if (score >= 80) return "Great job! You did very well! 🎉";
    if (score >= 70) return "Good work! Keep it up! 👍";
    if (score >= 60) return "Not bad! Room for improvement. 📚";
    return "Keep practicing! You'll get better! 💪";
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-gray-600">Loading results...</span>
          </div>
        </Card>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 bg-red-50 border-red-200">
          <p className="text-red-600 mb-4">{error || "Failed to load results"}</p>
          <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
        </Card>
      </div>
    );
  }

  const score = Math.round(attempt.score);
  const incorrect = attempt.totalQuestions - attempt.correctAnswers;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Results Summary */}
      <Card className={`p-8 mb-6 border-2 ${getScoreBg(score)}`}>
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h1>
          <p className="text-gray-600">{attempt.package?.title}</p>
        </div>

        <div className="text-center mb-8">
          <div className={`text-7xl font-bold ${getScoreColor(score)} mb-2`}>
            {score}%
          </div>
          <p className="text-xl text-gray-700">{getScoreMessage(score)}</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-white rounded-lg">
            <div className="text-3xl font-bold text-green-600">{attempt.correctAnswers}</div>
            <div className="text-sm text-gray-600">Correct</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg">
            <div className="text-3xl font-bold text-red-600">{incorrect}</div>
            <div className="text-sm text-gray-600">Incorrect</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg">
            <div className="text-3xl font-bold text-blue-600">{formatTime(attempt.timeSpent)}</div>
            <div className="text-sm text-gray-600">Time</div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Performance Breakdown</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Accuracy</span>
              <span className="font-medium text-gray-900">{score}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${score >= 80 ? 'bg-green-600' : score >= 60 ? 'bg-yellow-600' : 'bg-red-600'}`}
                style={{ width: `${score}%` }}
              />
            </div>

            <div className="flex justify-between text-sm mt-4">
              <span className="text-gray-600">Questions Answered</span>
              <span className="font-medium text-gray-900">{attempt.totalQuestions} / {attempt.totalQuestions}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Average Time per Question</span>
              <span className="font-medium text-gray-900">
                {Math.round(attempt.timeSpent / attempt.totalQuestions)}s
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Completed</span>
              <span className="font-medium text-gray-900">
                {new Date(attempt.completedAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Review Answers Section */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Review Answers</h2>
          <Button
            variant="outline"
            onClick={() => setShowReview(!showReview)}
          >
            {showReview ? "Hide Review" : "Show Review"}
          </Button>
        </div>

        {showReview && attempt.answers && (
          <div className="space-y-6 mt-6">
            {attempt.answers.map((answer, index) => {
              const question = answer.question;
              if (!question) return null;

              const correctAnswer = question.answers?.find((a) => a.isCorrect);

              return (
                <div
                  key={answer.id}
                  className={`p-6 rounded-lg border-2 ${
                    answer.isCorrect
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1">
                      {index + 1}. <RichText html={question.text} />
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        answer.isCorrect
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {answer.isCorrect ? "✓ Correct" : "✗ Incorrect"}
                    </span>
                  </div>

                  {question.imageUrl && (
                    <div className="mb-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={question.imageUrl}
                        alt="Question"
                        className="max-h-64 rounded-lg border border-gray-200"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    {question.answers?.map((ans, idx) => {
                      const isSelected = answer.selectedAnswerId === ans.id;
                      const isCorrectAnswer = ans.isCorrect;

                      return (
                        <div
                          key={ans.id}
                          className={`p-3 rounded-lg border ${
                            isCorrectAnswer
                              ? "bg-green-100 border-green-300"
                              : isSelected
                              ? "bg-red-100 border-red-300"
                              : "bg-white border-gray-200"
                          }`}
                        >
                          <div className="flex items-center">
                            <span className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <RichText className="text-gray-900" html={ans.text} />
                            {isCorrectAnswer && (
                              <span className="ml-auto text-green-600 font-medium text-sm">
                                ✓ Correct Answer
                              </span>
                            )}
                            {isSelected && !isCorrectAnswer && (
                              <span className="ml-auto text-red-600 font-medium text-sm">
                                Your Answer
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {question.explanation && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Explanation:</h4>
                      <RichText className="text-blue-800 text-sm" html={question.explanation} />
                      
                      {question.explanationImageUrl && (
                        <div className="mt-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={question.explanationImageUrl}
                            alt="Explanation diagram"
                            className="max-h-64 rounded-lg border border-blue-300"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Button variant="outline" onClick={() => router.push(`/quiz/${packageId}`)}>
          Retake Quiz
        </Button>
        <Button onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
