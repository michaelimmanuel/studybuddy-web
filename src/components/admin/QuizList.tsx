"use client";

import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { Card } from "@/components/ui/card";
import Button from "@/components/Button";
import EditQuizModal from "./modals/EditQuizModal";
import type { Quiz, Course, GetCourseQuizzesResponse } from "@/types";
import api from "@/lib/api";

interface QuizListProps {
  course: Course;
  onCreateQuiz: () => void;
}

export interface QuizListRef {
  refetch: () => Promise<void>;
}

const QuizList = forwardRef<QuizListRef, QuizListProps>(({ course, onCreateQuiz }, ref) => {
  const [quizzes, setQuizzes] = useState<GetCourseQuizzesResponse['quizzes']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await api.get<GetCourseQuizzesResponse>(`/api/quizzes/course/${course.id}`);
      setQuizzes(response.quizzes || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch quizzes");
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    refetch: fetchQuizzes
  }));

  useEffect(() => {
    fetchQuizzes();
  }, [course.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) {
      return;
    }

    try {
      await api.del(`/api/quizzes/${quizId}`);
      setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
    } catch (err: any) {
      alert(err.message || "Failed to delete quiz");
    }
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setShowEditModal(true);
  };

  const handleEditSuccess = (updatedQuiz: Quiz) => {
    setShowEditModal(false);
    setEditingQuiz(null);
    // Refetch the quizzes to get the updated data
    fetchQuizzes();
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading quizzes...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Course Quizzes</h3>
        <Button onClick={onCreateQuiz}>
          Create New Quiz
        </Button>
      </div>

      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      {quizzes.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="max-w-sm mx-auto">
            <div className="mb-4">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Quizzes Yet</h3>
            <p className="text-gray-500 mb-4">
              Create your first quiz to help students test their knowledge of this course.
            </p>
            <Button onClick={onCreateQuiz}>
              Create First Quiz
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-3">
                    <h4 className="text-lg font-semibold text-gray-900">{quiz.title}</h4>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {quiz.timeLimit} min
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Questions:</span>
                      <span className="ml-1">{quiz.questionCount || 0}</span>
                    </div>
                    <div>
                      <span className="font-medium">Submissions:</span>
                      <span className="ml-1">{quiz.submissionCount || 0}</span>
                    </div>
                    <div>
                      <span className="font-medium">Created:</span>
                      <span className="ml-1">{formatDate(quiz.createdAt)}</span>
                    </div>
                    <div>
                      <span className="font-medium">Time Limit:</span>
                      <span className="ml-1">{quiz.timeLimit} minutes</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/api/quizzes/${quiz.id}`, '_blank')}
                  >
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditQuiz(quiz as Quiz)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteQuiz(quiz.id)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                  >
                    Delete
                  </Button>
                </div>
              </div>

              {quiz.submissionCount && quiz.submissionCount > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => alert("View submissions functionality coming soon!")}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View {quiz.submissionCount} Submission{quiz.submissionCount !== 1 ? 's' : ''}
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
      
      {/* Edit Quiz Modal */}
      <EditQuizModal
        isOpen={showEditModal}
        quiz={editingQuiz}
        onClose={() => {
          setShowEditModal(false);
          setEditingQuiz(null);
        }}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
});

QuizList.displayName = "QuizList";

export default QuizList;