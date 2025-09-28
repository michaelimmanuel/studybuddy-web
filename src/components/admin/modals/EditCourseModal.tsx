"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal";
import Button from "@/components/Button";
import type { Course } from "@/types";

interface EditCourseModalProps {
  isOpen: boolean;
  course: Course | null;
  onClose: () => void;
  onSubmit: (courseData: { title: string; description: string }) => Promise<void>;
}

export default function EditCourseModal({ isOpen, course, onClose, onSubmit }: EditCourseModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: ""
  });
  const [errors, setErrors] = useState<{ title?: string; description?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form data when course changes
  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title,
        description: course.description
      });
    }
  }, [course]);

  const handleClose = () => {
    setFormData({ title: "", description: "" });
    setErrors({});
    onClose();
  };

  const validateForm = () => {
    const newErrors: { title?: string; description?: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      await onSubmit({
        title: formData.title.trim(),
        description: formData.description.trim()
      });
      handleClose();
    } catch (error) {
      console.error("Failed to update course:", error);
      setErrors({ general: "Failed to update course. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <>
      <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
        Cancel
      </Button>
      <Button type="submit" loading={isSubmitting} onClick={handleSubmit}>
        Update Course
      </Button>
    </>
  );

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={`Edit Course: ${course?.title || ''}`}
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">{errors.general}</p>
          </div>
        )}

        <div>
          <label htmlFor="edit-course-title" className="block text-sm font-medium text-gray-700 mb-1">
            Course Title *
          </label>
          <input
            id="edit-course-title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.title ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter course title"
            disabled={isSubmitting}
          />
          {errors.title && (
            <p className="text-sm text-red-600 mt-1">{errors.title}</p>
          )}
        </div>

        <div>
          <label htmlFor="edit-course-description" className="block text-sm font-medium text-gray-700 mb-1">
            Course Description *
          </label>
          <textarea
            id="edit-course-description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.description ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter course description"
            disabled={isSubmitting}
          />
          {errors.description && (
            <p className="text-sm text-red-600 mt-1">{errors.description}</p>
          )}
        </div>

        <div className="text-sm text-gray-500">
          * Required fields
        </div>
      </form>
    </Modal>
  );
}