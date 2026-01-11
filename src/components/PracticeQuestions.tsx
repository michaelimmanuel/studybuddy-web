"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import Button from "@/components/Button";
import type { Question, GetCourseQuestionsResponse } from "@/types";
import RichText from "@/components/RichText";
import api from "@/lib/api";

interface PracticeQuestionsProps {
  courseId: string;
  quizName?: string;
}

export default function PracticeQuestions({ courseId, quizName }: PracticeQuestionsProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  // For single-answer: string; for multi-answer: string[]
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionId: string]: string | string[] }>({});

  // If quizName starts with OSCE, treat all as multi-answer
  const isOSCE = quizName && quizName.trim().toUpperCase().startsWith('OSCE');
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await api.get<GetCourseQuestionsResponse>(`/api/courses/${courseId}/questions`);
        setQuestions(response.questions || []);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to fetch questions");
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [courseId]);

  // Detect if a question is multi-answer (more than one correct answer)
  function isMultiAnswer(q: Question) {
    if (isOSCE) return true;
    return Array.isArray(q.answers) && q.answers.filter((a: any) => a.isCorrect).length > 1;
  }

  // For single-answer: set string; for multi-answer: toggle in array
  const handleAnswerSelect = (questionId: string, answerId: string, multi: boolean) => {
    setSelectedAnswers((prev) => {
      if (!multi) {
        return { ...prev, [questionId]: answerId };
      } else {
        const prevArr = Array.isArray(prev[questionId]) ? (prev[questionId] as string[]) : [];
        if (prevArr.includes(answerId)) {
          // remove
          return { ...prev, [questionId]: prevArr.filter((id) => id !== answerId) };
        } else {
          // add
          return { ...prev, [questionId]: [...prevArr, answerId] };
        }
      }
    });
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const restartPractice = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const multi = currentQuestion ? isMultiAnswer(currentQuestion) : false;

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading practice questions...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4 bg-red-50 border-red-200">
        <p className="text-red-600">{error}</p>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="max-w-sm mx-auto">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Practice Questions Available</h3>
          <p className="text-gray-500">
            There are currently no questions available for practice in this course.
          </p>
        </div>
      </Card>
    );
  }

  if (showResults) {
    return (
      <Card className="p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <svg className="mx-auto h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Practice Complete!</h2>
          <p className="text-gray-600 mb-6">
            You answered {Object.keys(selectedAnswers).length} out of {questions.length} questions.
          </p>
          <div className="space-y-3">
            <Button onClick={restartPractice} className="w-full">
              Practice Again
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
              Back to Course
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (!currentQuestion) {
    return (
      <Card className="p-4 bg-yellow-50 border-yellow-200">
        <p className="text-yellow-600">No question available.</p>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <div className="max-w-3xl mx-auto">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            <RichText html={currentQuestion.text} />
          </h2>
          {currentQuestion.imageUrl && (
            <div className="mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={currentQuestion.imageUrl} alt="Question" className="max-h-72 rounded border mx-auto" />
            </div>
          )}
          <div className="space-y-3">
            {currentQuestion.answers.map((answer, index) => {
              const checked = multi
                ? Array.isArray(selectedAnswers[currentQuestion.id]) && (selectedAnswers[currentQuestion.id] as string[]).includes(answer.id)
                : selectedAnswers[currentQuestion.id] === answer.id;
              return (
                <label
                  key={answer.id}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    checked
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type={multi ? 'checkbox' : 'radio'}
                    name={`question-${currentQuestion.id}`}
                    value={answer.id}
                    checked={checked}
                    onChange={() => handleAnswerSelect(currentQuestion.id, answer.id, multi)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div className="ml-4 flex items-center">
                    <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <RichText className="text-gray-900" html={answer.text} />
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={previousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>
          <div className="flex space-x-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  index === currentQuestionIndex
                    ? 'bg-blue-600 text-white'
                    : selectedAnswers[questions[index].id]
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : 'bg-gray-100 text-gray-700 border border-gray-300'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <Button
            onClick={nextQuestion}
            disabled={multi
              ? !Array.isArray(selectedAnswers[currentQuestion.id]) || (selectedAnswers[currentQuestion.id] as string[]).length === 0
              : !selectedAnswers[currentQuestion.id]}
            className="min-w-[100px]"
          >
            {currentQuestionIndex < questions.length - 1 ? 'Next' : 'Finish Practice'}
          </Button>
        </div>
      </div>
    </Card>
  );
}