"use client";

import { useState } from "react";
import Modal from "./Modal";
import Button from "@/components/Button";
import type { Course, CreateQuizRequest, QuizQuestionForm, QuizAnswerForm, CreateQuizResponse } from "@/types";
import api from "@/lib/api";

interface CreateQuizModalProps {
  isOpen: boolean;
  course: Course | null;
  onClose: () => void;
  onSuccess?: (quiz: any) => void;
}

export default function CreateQuizModal({ isOpen, course, onClose, onSuccess }: CreateQuizModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    timeLimit: 30,
    questionCount: 1
  });
  const [questions, setQuestions] = useState<QuizQuestionForm[]>([
    {
      text: "",
      answers: [
        { text: "", isCorrect: true },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false }
      ]
    }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleClose = () => {
    setFormData({ title: "", timeLimit: 30, questionCount: 1 });
    setQuestions([{
      text: "",
      answers: [
        { text: "", isCorrect: true },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false }
      ]
    }]);
    setErrors({});
    onClose();
  };

  const handleQuestionCountChange = (count: number) => {
    const newCount = Math.max(1, Math.min(20, count)); // Limit between 1 and 20
    setFormData({ ...formData, questionCount: newCount });
    
    // Adjust questions array to match the desired count
    const currentQuestions = [...questions];
    
    if (newCount > currentQuestions.length) {
      // Add new questions
      const questionsToAdd = newCount - currentQuestions.length;
      for (let i = 0; i < questionsToAdd; i++) {
        currentQuestions.push({
          text: "",
          answers: [
            { text: "", isCorrect: true },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false }
          ]
        });
      }
    } else if (newCount < currentQuestions.length) {
      // Remove excess questions
      currentQuestions.splice(newCount);
    }
    
    setQuestions(currentQuestions);
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = "Quiz title is required";
    }

    if (formData.timeLimit < 1 || formData.timeLimit > 180) {
      newErrors.timeLimit = "Time limit must be between 1 and 180 minutes";
    }

    questions.forEach((question, qIndex) => {
      if (!question.text.trim()) {
        newErrors[`question_${qIndex}`] = "Question text is required";
      }

      const hasCorrectAnswer = question.answers.some((answer: QuizAnswerForm) => answer.isCorrect && answer.text.trim());
      if (!hasCorrectAnswer) {
        newErrors[`question_${qIndex}_correct`] = "Each question must have at least one correct answer";
      }

      const filledAnswers = question.answers.filter((answer: QuizAnswerForm) => answer.text.trim());
      if (filledAnswers.length < 2) {
        newErrors[`question_${qIndex}_answers`] = "Each question must have at least 2 answers";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !course) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const quizData: CreateQuizRequest = {
        courseId: course.id,
        title: formData.title.trim(),
        timeLimit: formData.timeLimit,
        questions: questions.map(question => ({
          text: question.text.trim(),
          answers: question.answers
            .filter((answer: QuizAnswerForm) => answer.text.trim())
            .map((answer: QuizAnswerForm) => ({
              text: answer.text.trim(),
              isCorrect: answer.isCorrect
            }))
        }))
      };

      const response = await api.post<CreateQuizResponse>(`/api/quizzes`, quizData);
      
      if (onSuccess) {
        onSuccess(response);
      }
      
      handleClose();
    } catch (error: any) {
      console.error("Failed to create quiz:", error);
      setErrors({ general: error.message || "Failed to create quiz. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addQuestion = () => {
    const newQuestions = [...questions, {
      text: "",
      answers: [
        { text: "", isCorrect: true },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false }
      ]
    }];
    setQuestions(newQuestions);
    setFormData({ ...formData, questionCount: newQuestions.length });
  };

  const removeQuestion = (questionIndex: number) => {
    if (questions.length > 1) {
      const newQuestions = questions.filter((_, index) => index !== questionIndex);
      setQuestions(newQuestions);
      setFormData({ ...formData, questionCount: newQuestions.length });
    }
  };

  const updateQuestion = (questionIndex: number, text: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].text = text;
    setQuestions(updatedQuestions);
  };

  const updateAnswer = (questionIndex: number, answerIndex: number, text: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].answers[answerIndex].text = text;
    setQuestions(updatedQuestions);
  };

  const toggleCorrectAnswer = (questionIndex: number, answerIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].answers[answerIndex].isCorrect = 
      !updatedQuestions[questionIndex].answers[answerIndex].isCorrect;
    setQuestions(updatedQuestions);
  };

  const addAnswer = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[questionIndex].answers.length < 6) {
      updatedQuestions[questionIndex].answers.push({ text: "", isCorrect: false });
      setQuestions(updatedQuestions);
    }
  };

  const removeAnswer = (questionIndex: number, answerIndex: number) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[questionIndex].answers.length > 2) {
      updatedQuestions[questionIndex].answers.splice(answerIndex, 1);
      setQuestions(updatedQuestions);
    }
  };

  if (!course) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Create Quiz for ${course.title}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quiz Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quiz Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter quiz title..."
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Limit (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="180"
                value={formData.timeLimit}
                onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) || 30 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.timeLimit && <p className="text-red-500 text-sm mt-1">{errors.timeLimit}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Questions
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.questionCount}
                onChange={(e) => handleQuestionCountChange(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Questions will be automatically added/removed to match this number
              </p>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-medium text-gray-900">Questions ({questions.length})</h4>
            <p className="text-sm text-gray-600">Create your quiz questions and answers below</p>
          </div>

          {questions.map((question, qIndex) => (
            <div key={qIndex} className="border border-gray-200 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="font-medium text-gray-900">Question {qIndex + 1}</h5>
                {questions.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </Button>
                )}
              </div>

              <div>
                <textarea
                  value={question.text}
                  onChange={(e) => updateQuestion(qIndex, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter question text..."
                />
                {errors[`question_${qIndex}`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`question_${qIndex}`]}</p>
                )}
                {errors[`question_${qIndex}_correct`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`question_${qIndex}_correct`]}</p>
                )}
                {errors[`question_${qIndex}_answers`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`question_${qIndex}_answers`]}</p>
                )}
              </div>

              {/* Answers */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Answers</label>
                  {question.answers.length < 6 && (
                    <Button
                      type="button"
                      onClick={() => addAnswer(qIndex)}
                      variant="ghost"
                      size="sm"
                    >
                      Add Answer
                    </Button>
                  )}
                </div>
                
                {question.answers.map((answer: QuizAnswerForm, aIndex: number) => (
                  <div key={aIndex} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={answer.isCorrect}
                      onChange={() => toggleCorrectAnswer(qIndex, aIndex)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      value={answer.text}
                      onChange={(e) => updateAnswer(qIndex, aIndex, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Answer ${aIndex + 1}...`}
                    />
                    {question.answers.length > 2 && (
                      <Button
                        type="button"
                        onClick={() => removeAnswer(qIndex, aIndex)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <p className="text-xs text-gray-500">
                  ✓ = Correct answer. Each question must have at least one correct answer.
                </p>
              </div>
            </div>
          ))}
          
          {/* Add Question Button at Bottom */}
          <div className="flex justify-center pt-4 border-t border-gray-200">
            <Button
              type="button"
              onClick={addQuestion}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <span>+</span>
              <span>Add Question</span>
            </Button>
          </div>
        </div>

        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-600 text-sm">{errors.general}</p>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Quiz"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}