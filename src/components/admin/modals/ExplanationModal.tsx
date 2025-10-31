"use client";

import Modal from "./Modal";
import Button from "@/components/Button";
import RichText from "@/components/RichText";
import type { Question } from "@/types";

interface ExplanationModalProps {
  isOpen: boolean;
  question: Question | null;
  onClose: () => void;
}

export default function ExplanationModal({ isOpen, question, onClose }: ExplanationModalProps) {
  if (!question) return null;

  const correctAnswersCount = question.answers.filter(answer => answer.isCorrect).length;
  const hasExplanation = question.explanation && question.explanation.trim().length > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Question Details & Explanation">
      <div className="space-y-6">
        {/* Question Text */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Question:</h4>
          <RichText className="text-gray-700 leading-relaxed" html={question.text} />
        </div>

        {/* Question Stats */}
        <div className="flex items-center space-x-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <span className="flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            {question.answers.length} Total Answers
          </span>
          <span className="flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            {correctAnswersCount} Correct Answer{correctAnswersCount !== 1 ? 's' : ''}
          </span>
          <span className="flex items-center">
            <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
            {hasExplanation ? 'Has Explanation' : 'No Explanation'}
          </span>
        </div>

        {/* Answers with correct indicators */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Answers:</h4>
          <div className="space-y-2">
            {question.answers.map((answer, index) => (
              <div 
                key={answer.id} 
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  answer.isCorrect 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
                  answer.isCorrect 
                    ? 'bg-green-100 border-green-300 text-green-800' 
                    : 'bg-white border-gray-300 text-gray-600'
                }`}>
                  {String.fromCharCode(65 + index)}
                </span>
                <RichText className="flex-1 text-gray-700" html={answer.text} />
                {answer.isCorrect && (
                  <span className="text-green-600 text-sm font-medium flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Correct
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Explanation */}
        {hasExplanation ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <h4 className="font-medium text-blue-900">Explanation:</h4>
            </div>
            <RichText className="text-blue-800 leading-relaxed" html={question.explanation} />
            
            {/* Explanation Image */}
            {question.explanationImageUrl && (
              <div className="mt-4">
                <img 
                  src={question.explanationImageUrl} 
                  alt="Explanation diagram" 
                  className="max-w-full h-auto rounded-lg border border-blue-300"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-yellow-800 text-sm font-medium">No explanation provided for this question.</p>
            </div>
            <p className="text-yellow-700 text-sm mt-2">Consider adding an explanation to help students understand the concept better.</p>
          </div>
        )}
      </div>

      {/* Close Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200 mt-6">
        <Button
          type="button"
          variant="default"
          onClick={onClose}
        >
          Close
        </Button>
      </div>
    </Modal>
  );
}