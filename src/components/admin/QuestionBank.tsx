"use client";

import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { Card } from "@/components/ui/card";
import Button from "@/components/Button";
import EditQuestionModal from "./modals/EditQuestionModal";
import ExplanationModal from "./modals/ExplanationModal";
import type { Question, Course, GetCourseQuestionsResponse } from "@/types";
import api from "@/lib/api";

interface QuestionBankProps {
  course: Course;
  onCreateQuestion: () => void;
  userRole?: string;
}

export interface QuestionBankRef {
  refetch: () => Promise<void>;
}

const QuestionBank = forwardRef<QuestionBankRef, QuestionBankProps>(({ course, onCreateQuestion, userRole = 'admin' }, ref) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showExplanationModal, setShowExplanationModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  const fetchQuestions = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await api.get<GetCourseQuestionsResponse>(`/api/courses/${course.id}/questions?page=${page}&limit=10`);
      setQuestions(response.questions || []);
      setPagination(response.pagination);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch questions");
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    refetch: () => fetchQuestions(pagination.page)
  }));

  useEffect(() => {
    fetchQuestions();
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

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question? This action cannot be undone.")) {
      return;
    }

    try {
      await api.del(`/api/questions/${questionId}`);
      setQuestions(questions.filter(question => question.id !== questionId));
    } catch (err: any) {
      alert(err.message || "Failed to delete question");
    }
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setShowEditModal(true);
  };

  const handleEditSuccess = (updatedQuestion: Question) => {
    setShowEditModal(false);
    setEditingQuestion(null);
    // Refetch the questions to get the updated data
    fetchQuestions(pagination.page);
  };

  const handleShowExplanation = (question: Question) => {
    setSelectedQuestion(question);
    setShowExplanationModal(true);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchQuestions(newPage);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading questions...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Question Bank</h3>
          <p className="text-sm text-gray-600 mt-1">
            {pagination.total} question{pagination.total !== 1 ? 's' : ''} total
          </p>
        </div>
        {userRole === 'admin' && (
          <Button onClick={onCreateQuestion}>
            Create New Question
          </Button>
        )}
      </div>

      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      {questions.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="max-w-sm mx-auto">
            <div className="mb-4">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Questions Yet</h3>
            <p className="text-gray-500 mb-4">
              Create your first question to build the knowledge base for this course.
            </p>
            {userRole === 'admin' && (
              <Button onClick={onCreateQuestion}>
                Create First Question
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4">
            {questions.map((question) => (
              <Card key={question.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-3">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{question.text}</h4>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <p className="text-sm font-medium text-gray-700">Answers:</p>
                      <div className="grid gap-2">
                        {question.answers.map((answer, index) => (
                          <div key={answer.id} className="flex items-center space-x-2 text-sm">
                            <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium">
                              {String.fromCharCode(65 + index)}
                            </span>
                            <span className="text-gray-700">{answer.text}</span>
                            {userRole === 'admin' && answer.isCorrect && (
                              <span className="text-green-600 text-xs">✓ Correct</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Created:</span>
                      <span className="ml-1">{formatDate(question.createdAt)}</span>
                    </div>
                  </div>

                  {userRole === 'admin' && (
                    <div className="flex flex-col space-y-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditQuestion(question)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShowExplanation(question)}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                      >
                        View Explanation
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.totalPages} 
                ({pagination.total} questions total)
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Edit Question Modal */}
      <EditQuestionModal
        isOpen={showEditModal}
        question={editingQuestion}
        onClose={() => {
          setShowEditModal(false);
          setEditingQuestion(null);
        }}
        onSuccess={handleEditSuccess}
      />

      {/* Explanation Modal */}
      <ExplanationModal
        isOpen={showExplanationModal}
        question={selectedQuestion}
        onClose={() => {
          setShowExplanationModal(false);
          setSelectedQuestion(null);
        }}
      />
    </div>
  );
});

QuestionBank.displayName = "QuestionBank";

export default QuestionBank;