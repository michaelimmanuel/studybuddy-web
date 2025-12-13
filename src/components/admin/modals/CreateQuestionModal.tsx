"use client";

import { useState, useRef } from "react";
import Modal from "./Modal";
import Button from "@/components/Button";
import ImageUpload from "@/components/ImageUpload";
import type { CreateQuestionRequest, CreateQuestionResponse, AnswerForm, QuestionForm } from "@/types";
import api from "@/lib/api";
import { normalizeRichText } from "@/lib/text";

interface Course {
  id: string;
  title: string;
  description?: string;
}

type CourseRef = { id: string; title: string };

interface CreateQuestionModalProps {
  isOpen: boolean;
  course: CourseRef | null;
  onClose: () => void;
  onSuccess?: (question: any) => void;
}

export default function CreateQuestionModal({ isOpen, course, onClose, onSuccess }: CreateQuestionModalProps) {
  const [questionText, setQuestionText] = useState("");
  const [questionExplanation, setQuestionExplanation] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [explanationImageUrl, setExplanationImageUrl] = useState("");
  const questionTextRef = useRef<HTMLDivElement | null>(null);
  const questionExplanationRef = useRef<HTMLDivElement | null>(null);
  const answerInputRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [answers, setAnswers] = useState<AnswerForm[]>([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Track if we're typing to prevent unnecessary re-renders
  const isTypingQuestionText = useRef(false);
  const isTypingExplanation = useRef(false);
  const isTypingAnswer = useRef<number | null>(null);

  // Track active formatting states
  const [activeFormats, setActiveFormats] = useState({ b: false, i: false, u: false });

  // Check which formats are active at cursor
  const updateActiveFormats = () => {
    const formats = { b: false, i: false, u: false };
    
    if (document.queryCommandState('bold')) formats.b = true;
    if (document.queryCommandState('italic')) formats.i = true;
    if (document.queryCommandState('underline')) formats.u = true;
    
    setActiveFormats(formats);
  };

  const wrapSelection = (
    el: HTMLTextAreaElement | HTMLInputElement | null,
    value: string,
    setValue: (v: string) => void,
    tag: 'b' | 'i' | 'u'
  ) => {
    if (!el) {
      setValue(`<${tag}>${value}</${tag}>`);
      return;
    }
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? value.length;
    const before = value.slice(0, start);
    const selected = value.slice(start, end) || value;
    const after = value.slice(end);
    const wrapped = `${before}<${tag}>${selected}</${tag}>${after}`;
    setValue(wrapped);
    // Restore focus and cursor position after state update
    setTimeout(() => {
      const newPos = start + tag.length + 2; // after opening tag
      el.focus();
      el.setSelectionRange(newPos + selected.length, newPos + selected.length);
    }, 0);
  };

  const applyFormatContentEditable = (tag: 'b' | 'i' | 'u') => {
    document.execCommand(tag === 'b' ? 'bold' : tag === 'i' ? 'italic' : 'underline', false);
  };

  const handleClose = () => {
    setQuestionText("");
    setQuestionExplanation("");
    setImageUrl("");
    setExplanationImageUrl("");
    setAnswers([
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false }
    ]);
    setErrors({});
    onClose();
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Validate question text
    const qt = normalizeRichText(questionText);
    if (!qt.plainText.trim()) {
      newErrors.questionText = "Question text is required";
    } else if (qt.length < 10) {
      newErrors.questionText = "Question text must be at least 10 characters";
    } else if (qt.length > 1000) {
      newErrors.questionText = "Question text must be less than 1000 characters";
    }

    // Validate answers
    const validAnswers = answers
      .map(a => ({ ...a, norm: normalizeRichText(a.text) }))
      .filter(answer => answer.norm.plainText.trim());
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

    if (!validateForm() || !course) return;

    setIsSubmitting(true);

    try {
      const qtNorm = normalizeRichText(questionText);
      const explNorm = normalizeRichText(questionExplanation);
      const questionData: CreateQuestionRequest = {
        text: qtNorm.sanitizedHtml,
        answers: answers
          .map(answer => ({ ...answer, norm: normalizeRichText(answer.text) }))
          .filter(answer => answer.norm.plainText.trim())
          .map(answer => ({
            text: answer.norm.sanitizedHtml,
            isCorrect: answer.isCorrect
          })),
        explanation: explNorm.plainText ? explNorm.sanitizedHtml : undefined,
        imageUrl: imageUrl.trim() || undefined,
        explanationImageUrl: explanationImageUrl.trim() || undefined
      };

      const response = await api.post<CreateQuestionResponse>(`/api/courses/${course.id}/questions`, questionData);
      
      if (onSuccess) {
        onSuccess(response.question);
      }
      
      handleClose();
    } catch (error: any) {
      console.error("Failed to create question:", error);
      setErrors({ general: error.message || "Failed to create question. Please try again." });
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

  if (!course) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Create Question for ${course.title}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Text (10-1000 characters)
          </label>
          <div className="flex gap-2 mb-2">
            <Button 
              type="button" 
              variant={activeFormats.b ? "default" : "ghost"} 
              size="sm" 
              onClick={() => applyFormatContentEditable('b')}
              className={activeFormats.b ? "bg-blue-600 text-white hover:bg-blue-700" : ""}
            >
              <b>B</b>
            </Button>
            <Button 
              type="button" 
              variant={activeFormats.i ? "default" : "ghost"} 
              size="sm" 
              onClick={() => applyFormatContentEditable('i')}
              className={activeFormats.i ? "bg-blue-600 text-white hover:bg-blue-700" : ""}
            >
              <i>I</i>
            </Button>
            <Button 
              type="button" 
              variant={activeFormats.u ? "default" : "ghost"} 
              size="sm" 
              onClick={() => applyFormatContentEditable('u')}
              className={activeFormats.u ? "bg-blue-600 text-white hover:bg-blue-700" : ""}
            >
              <u>U</u>
            </Button>
          </div>
          <div
            ref={(el) => {
              questionTextRef.current = el;
              if (el && !isTypingQuestionText.current && el.innerHTML !== questionText) {
                el.innerHTML = questionText;
              }
            }}
            contentEditable
            onInput={(e) => {
              isTypingQuestionText.current = true;
              setQuestionText(e.currentTarget.innerHTML);
              setTimeout(() => { isTypingQuestionText.current = false; }, 0);
            }}
            onKeyUp={updateActiveFormats}
            onMouseUp={updateActiveFormats}
            onFocus={updateActiveFormats}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] max-h-[200px] overflow-auto"
            suppressContentEditableWarning
          />

          <div className="flex justify-between items-center mt-1">
            {errors.questionText && <p className="text-red-500 text-sm">{errors.questionText}</p>}
            <small className="text-gray-500 ml-auto">{normalizeRichText(questionText).length}/1000 characters</small>
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
              <div className="flex-1">
                <div className="flex gap-2 mb-2">
                  <Button 
                    type="button" 
                    variant={activeFormats.b ? "default" : "ghost"} 
                    size="sm" 
                    onClick={() => {
                      const el = answerInputRefs.current[index];
                      if (el) el.focus();
                      applyFormatContentEditable('b');
                    }}
                    className={activeFormats.b ? "bg-blue-600 text-white hover:bg-blue-700" : ""}
                  >
                    <b>B</b>
                  </Button>
                  <Button 
                    type="button" 
                    variant={activeFormats.i ? "default" : "ghost"} 
                    size="sm" 
                    onClick={() => {
                      const el = answerInputRefs.current[index];
                      if (el) el.focus();
                      applyFormatContentEditable('i');
                    }}
                    className={activeFormats.i ? "bg-blue-600 text-white hover:bg-blue-700" : ""}
                  >
                    <i>I</i>
                  </Button>
                  <Button 
                    type="button" 
                    variant={activeFormats.u ? "default" : "ghost"} 
                    size="sm" 
                    onClick={() => {
                      const el = answerInputRefs.current[index];
                      if (el) el.focus();
                      applyFormatContentEditable('u');
                    }}
                    className={activeFormats.u ? "bg-blue-600 text-white hover:bg-blue-700" : ""}
                  >
                    <u>U</u>
                  </Button>
                </div>
                <div
                  ref={(el) => { 
                    answerInputRefs.current[index] = el;
                    if (el && isTypingAnswer.current !== index && el.innerHTML !== answer.text) {
                      el.innerHTML = answer.text;
                    }
                  }}
                  contentEditable
                  onInput={(e) => {
                    isTypingAnswer.current = index;
                    updateAnswer(index, e.currentTarget.innerHTML);
                    setTimeout(() => { isTypingAnswer.current = null; }, 0);
                  }}
                  onKeyUp={updateActiveFormats}
                  onMouseUp={updateActiveFormats}
                  onFocus={updateActiveFormats}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[40px] max-h-[100px] overflow-auto"
                  suppressContentEditableWarning
                />
              </div>
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
            Question Explanation (optional, 0-5000 characters)
          </label>
          <div className="flex gap-2 mb-2">
            <Button 
              type="button" 
              variant={activeFormats.b ? "default" : "ghost"} 
              size="sm" 
              onClick={() => applyFormatContentEditable('b')}
              className={activeFormats.b ? "bg-blue-600 text-white hover:bg-blue-700" : ""}
            >
              <b>B</b>
            </Button>
            <Button 
              type="button" 
              variant={activeFormats.i ? "default" : "ghost"} 
              size="sm" 
              onClick={() => applyFormatContentEditable('i')}
              className={activeFormats.i ? "bg-blue-600 text-white hover:bg-blue-700" : ""}
            >
              <i>I</i>
            </Button>
            <Button 
              type="button" 
              variant={activeFormats.u ? "default" : "ghost"} 
              size="sm" 
              onClick={() => applyFormatContentEditable('u')}
              className={activeFormats.u ? "bg-blue-600 text-white hover:bg-blue-700" : ""}
            >
              <u>U</u>
            </Button>
          </div>
          <div
            ref={(el) => {
              questionExplanationRef.current = el;
              if (el && !isTypingExplanation.current && el.innerHTML !== questionExplanation) {
                el.innerHTML = questionExplanation;
              }
            }}
            contentEditable
            onInput={(e) => {
              isTypingExplanation.current = true;
              setQuestionExplanation(e.currentTarget.innerHTML);
              setTimeout(() => { isTypingExplanation.current = false; }, 0);
            }}
            onKeyUp={updateActiveFormats}
            onMouseUp={updateActiveFormats}
            onFocus={updateActiveFormats}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[75px] max-h-[150px] overflow-auto"
            suppressContentEditableWarning
          />
          <div className="flex justify-between items-center mt-1">
            <small className="text-gray-500">This explanation will help students understand the concept</small>
            <small className="text-gray-500">{normalizeRichText(questionExplanation).length}/5000 characters</small>
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
            {isSubmitting ? "Creating..." : "Create Question"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}