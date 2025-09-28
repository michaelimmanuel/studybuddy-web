"use client";

import { useState } from "react";
import Modal from "./Modal";
import Button from "@/components/Button";
import type { Course } from "@/types";

interface DeleteCourseModalProps {
  isOpen: boolean;
  course: Course | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function DeleteCourseModal({ isOpen, course, onClose, onConfirm }: DeleteCourseModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleConfirm = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      await onConfirm();
      handleClose();
    } catch (error) {
      console.error("Failed to delete course:", error);
      setError("Failed to delete course. It may have existing enrollments.");
    } finally {
      setIsDeleting(false);
    }
  };

  const footer = (
    <>
      <Button variant="outline" onClick={handleClose} disabled={isDeleting}>
        Cancel
      </Button>
      <Button 
        variant="outline" 
        onClick={handleConfirm} 
        loading={isDeleting}
        className="text-red-600 hover:text-red-700 hover:border-red-300 hover:bg-red-50"
      >
        Delete Course
      </Button>
    </>
  );

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title="Delete Course"
      footer={footer}
    >
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <svg className="flex-shrink-0 w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Warning</h3>
              <p className="text-sm text-yellow-700 mt-1">
                This action cannot be undone. The course will be permanently deleted.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-gray-900">
            Are you sure you want to delete the following course?
          </p>
          
          {course && (
            <div className="bg-gray-50 border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900">{course.title}</h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                {course.description}
              </p>
              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                <span>{course.enrollmentCount} enrollments</span>
                <span>Created {new Date(course.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          )}

          {course && course.enrollmentCount > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                <strong>Note:</strong> This course has {course.enrollmentCount} enrollment{course.enrollmentCount !== 1 ? 's' : ''}. 
                You may not be able to delete it if there are active enrollments.
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}