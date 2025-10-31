"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal";
import Button from "@/components/Button";
import ImageUpload from "@/components/ImageUpload";
import type { Question, UpdateQuestionRequest, UpdateQuestionResponse, AnswerForm } from "@/types";
import api from "@/lib/api";

interface EditQuestionModalProps {
  isOpen: boolean;
  question: Question | null;
  onClose: () => void;
  onSuccess?: (question: Question) => void;
}

export default function EditQuestionModal({ isOpen, question, onClose, onSuccess }: EditQuestionModalProps) {
  const [questionText, setQuestionText] = useState("");
  const [questionExplanation, setQuestionExplanation] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [explanationImageUrl, setExplanationImageUrl] = useState("");
  const [answers, setAnswers] = useState<AnswerForm[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (question) {
      setQuestionText(question.text);
      setQuestionExplanation(question.explanation || "");
      setImageUrl(question.imageUrl || "");
      setExplanationImageUrl(question.explanationImageUrl || "");
      setAnswers(question.answers.map(answer => ({
        text: answer.text,
        isCorrect: answer.isCorrect || false
      })));
    }
  }, [question]);

  const handleClose = () => {
    setQuestionText("");
    setQuestionExplanation("");
    setImageUrl("");
    setExplanationImageUrl("");
    setAnswers([]);
    setErrors({});
    onClose();
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Validate question text
    if (!questionText.trim()) {
      newErrors.questionText = "Question text is required";
    } else if (questionText.trim().length < 10) {
      newErrors.questionText = "Question text must be at least 10 characters";
    } else if (questionText.trim().length > 1000) {
      newErrors.questionText = "Question text must be less than 1000 characters";
    }

    // Validate answers
    const validAnswers = answers.filter(answer => answer.text.trim());
    if (validAnswers.length < 2) {
      newErrors.answers = "At least 2 answers must be filled";
    }

    const hasCorrectAnswer = validAnswers.some(answer => answer.isCorrect);
    if (!hasCorrectAnswer) {
      newErrors.correct = "At least one answer must be marked as correct";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !question) return;

    setIsSubmitting(true);

    try {
      const updateData: UpdateQuestionRequest = {
        text: questionText.trim(),
        answers: answers
          .filter(answer => answer.text.trim())
          .map(answer => ({
            text: answer.text.trim(),
            isCorrect: answer.isCorrect
          })),
        explanation: questionExplanation.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        explanationImageUrl: explanationImageUrl.trim() || undefined
      };

      const response = await api.put<UpdateQuestionResponse>(`/api/questions/${question.id}`, updateData);
      
      if (onSuccess) {
        onSuccess(response.question);
      }
      
      handleClose();
    } catch (error: any) {
      console.error("Failed to update question:", error);
      setErrors({ general: error.message || "Failed to update question. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addAnswer = () => {
    if (answers.length < 6) {
      setAnswers([...answers, { text: "", isCorrect: false }]);
    }
  };

  const removeAnswer = (index: number) => {
    if (answers.length > 2) {
      setAnswers(answers.filter((_, i) => i !== index));
    }
  };

  const updateAnswer = (index: number, text: string) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index].text = text;
    setAnswers(updatedAnswers);
  };

  const toggleCorrectAnswer = (index: number) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index].isCorrect = !updatedAnswers[index].isCorrect;
    setAnswers(updatedAnswers);
  };

  if (!question) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Question">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Text (10-1000 characters)
          </label>
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Enter your question here..."
            minLength={10}
            maxLength={1000}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.questionText && <p className="text-red-500 text-sm">{errors.questionText}</p>}
            <small className="text-gray-500 ml-auto">{questionText.length}/1000 characters</small>
          </div>
        </div>

        {/* Answers */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Answers (2-6 answers, at least 2 must be filled)
            </label>
            {answers.length < 6 && (
              <Button
                type="button"
                onClick={addAnswer}
                variant="ghost"
                size="sm"
              >
                Add Answer
              </Button>
            )}
          </div>
          
          {answers.map((answer, index) => (
            <div key={index} className="flex items-center space-x-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={answer.isCorrect}
                  onChange={() => toggleCorrectAnswer(index)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Correct</span>
              </label>
              <input
                type="text"
                value={answer.text}
                onChange={(e) => updateAnswer(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Answer ${index + 1}...`}
                maxLength={500}
                required
              />
              {answers.length > 2 && (
                <Button
                  type="button"
                  onClick={() => removeAnswer(index)}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </Button>
              )}
            </div>
          ))}

          {errors.answers && <p className="text-red-500 text-sm">{errors.answers}</p>}
          {errors.correct && <p className="text-red-500 text-sm">{errors.correct}</p>}
        </div>

        {/* Question Explanation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Explanation (optional, 0-1000 characters)
          </label>
          <textarea
            value={questionExplanation}
            onChange={(e) => setQuestionExplanation(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Provide an explanation for this question to help students learn..."
            maxLength={1000}
          />
          <div className="flex justify-between items-center mt-1">
            <small className="text-gray-500">This explanation will help students understand the concept</small>
            <small className="text-gray-500">{questionExplanation.length}/1000 characters</small>
          </div>
        </div>

        {/* Tencent COS Image Upload */}
        <ImageUpload
          onUploadComplete={(url) => setImageUrl(url)}
          onUploadError={(error) => setErrors({ ...errors, imageUrl: error })}
          currentImageUrl={imageUrl}
          folder="questions"
          label="Question Image (Optional)"
          buttonText="Upload Image"
        />

        {/* Explanation Image Upload */}
        <ImageUpload
          onUploadComplete={(url) => setExplanationImageUrl(url)}
          onUploadError={(error) => setErrors({ ...errors, explanationImageUrl: error })}
          currentImageUrl={explanationImageUrl}
          folder="explanations"
          label="Explanation Image (Optional)"
          buttonText="Upload Explanation Image"
        />

        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-600 text-sm">{errors.general}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[100px]"
          >
            {isSubmitting ? "Updating..." : "Update Question"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}