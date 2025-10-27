"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import Button from "@/components/Button";
import api from "@/lib/api";
import type { Package, Question } from "@/types";

interface QuizResult {
  questionId: string;
  question: Question;
  selectedAnswerId: string | null;
  isCorrect: boolean;
}

export default function QuizResultsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const packageId = params.id as string;

  const [pkg, setPackage] = useState<Package | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);

  // Get results from URL params
  const score = parseInt(searchParams.get("score") || "0");
  const correct = parseInt(searchParams.get("correct") || "0");
  const total = parseInt(searchParams.get("total") || "0");
  const timeSpent = parseInt(searchParams.get("time") || "0");

  useEffect(() => {
    fetchPackageDetails();
  }, [packageId]);

  const fetchPackageDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ success: boolean; data: Package }>(`/api/packages/${packageId}`);
      
      const packageData = response.data;
      setPackage(packageData);

      const packageQuestions = packageData.packageQuestions || [];
      const sortedQuestions = packageQuestions
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((pq) => pq.question);

      setQuestions(sortedQuestions);
    } catch (err: any) {
      console.error("Failed to load package details:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getScoreColor = () => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = () => {
    if (score >= 80) return "bg-green-50 border-green-200";
    if (score >= 60) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  const getScoreMessage = () => {
    if (score >= 90) return "Excellent! Outstanding performance!";
    if (score >= 80) return "Great job! You did very well!";
    if (score >= 70) return "Good work! Keep it up!";
    if (score >= 60) return "Not bad! Room for improvement.";
    return "Keep practicing! You'll get better!";
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Results Summary */}
      <Card className={`p-8 mb-6 border-2 ${getScoreBg()}`}>
        <div className="text-center">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Completed!</h1>
          <p className="text-lg text-gray-600 mb-6">{pkg?.title}</p>

          <div className={`text-6xl font-bold mb-2 ${getScoreColor()}`}>
            {score}%
          </div>
          <p className={`text-xl font-medium mb-6 ${getScoreColor()}`}>
            {getScoreMessage()}
          </p>

          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
              <div className="text-2xl font-bold text-green-600">{correct}</div>
              <div className="text-sm text-gray-600">Correct</div>
            </div>
            <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
              <div className="text-2xl font-bold text-red-600">{total - correct}</div>
              <div className="text-sm text-gray-600">Incorrect</div>
            </div>
            <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
              <div className="text-2xl font-bold text-blue-600">{formatTime(timeSpent)}</div>
              <div className="text-sm text-gray-600">Time Spent</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Performance Breakdown */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Performance Breakdown</h2>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Accuracy</span>
              <span className="font-medium text-gray-900">{score}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <div className="text-sm text-gray-600">Questions Answered</div>
              <div className="text-2xl font-bold text-gray-900">{total}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Average Time per Question</div>
              <div className="text-2xl font-bold text-gray-900">
                {total > 0 ? Math.round(timeSpent / total) : 0}s
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Review Section */}
      {showReview && questions.length > 0 && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Question Review</h2>
          <p className="text-sm text-gray-600 mb-4">
            Note: This is a general review. Individual answer feedback is not stored in this version.
          </p>
          
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={question.id} className="border-b pb-4 last:border-b-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">
                    Question {index + 1}: {question.text}
                  </h3>
                </div>
                
                {question.imageUrl && (
                  <div className="mb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={question.imageUrl}
                      alt="Question"
                      className="max-h-48 rounded border"
                    />
                  </div>
                )}

                <div className="text-sm text-gray-600 ml-4">
                  {question.answers.map((answer, aIndex) => (
                    <div key={answer.id} className="py-1">
                      {String.fromCharCode(65 + aIndex)}. {answer.text}
                      {answer.isCorrect && <span className="ml-2 text-green-600 font-medium">✓ Correct</span>}
                    </div>
                  ))}
                </div>
                
                {question.explanation && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-900">
                      <strong>Explanation:</strong> {question.explanation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          onClick={() => setShowReview(!showReview)}
          className="flex-1"
        >
          {showReview ? "Hide Review" : "Review Answers"}
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push(`/quiz/${packageId}`)}
          className="flex-1"
        >
          Retake Quiz
        </Button>
        <Button
          onClick={() => router.push("/quiz")}
          className="flex-1"
        >
          Back to Quizzes
        </Button>
      </div>

      {/* Motivational Message */}
      <Card className="p-6 mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="text-center">
          <p className="text-gray-700 font-medium">
            {score >= 80 
              ? "🎉 Amazing work! Keep up the excellent performance!"
              : score >= 60
              ? "💪 Good effort! Practice makes perfect!"
              : "📚 Don't give up! Review the material and try again!"}
          </p>
        </div>
      </Card>
    </div>
  );
}
