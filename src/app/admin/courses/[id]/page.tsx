"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EditCourseModal from "@/components/admin/modals/EditCourseModal";
import DeleteCourseModal from "@/components/admin/modals/DeleteCourseModal";
import CreateQuizModal from "@/components/admin/modals/CreateQuizModal";
import QuizList, { QuizListRef } from "@/components/admin/QuizList";
import api from "@/lib/api";
import type { Course, GetCourseByIdResponse } from "@/types";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const quizListRef = useRef<QuizListRef>(null);

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateQuizModal, setShowCreateQuizModal] = useState(false);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await api.get<GetCourseByIdResponse>(`/api/courses/${courseId}`);
      setCourse(response.course);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch course");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const handleEditSuccess = (updatedCourse: Course) => {
    setCourse(updatedCourse);
    setShowEditModal(false);
  };

  const handleDeleteSuccess = () => {
    setShowDeleteModal(false);
    router.push('/admin/courses');
  };

  const handleQuizCreateSuccess = async (quiz: any) => {
    setShowCreateQuizModal(false);
    // Refetch the quiz list to show the newly created quiz
    if (quizListRef.current) {
      await quizListRef.current.refetch();
    }
  };

  const handleDeleteCourse = async () => {
    if (!course) return;
    
    try {
      await api.del(`/api/courses/${course.id}`);
      // Success will be handled by the modal's onSuccess callback
    } catch (error: any) {
      throw new Error(error.message || "Failed to delete course");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="bg-white rounded-lg p-8 space-y-6">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-red-400 text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h2>
            <p className="text-gray-600 mb-6">{error || "The course you're looking for doesn't exist."}</p>
            <Button variant="default" onClick={() => router.push('/admin/courses')}>
              Back to Courses
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Actions */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <Button 
              variant="outline" 
              onClick={() => router.push('/admin/courses')}
              className="mb-4"
            >
              ← Back to Courses
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
            <p className="text-gray-600 mt-2">Course Details</p>
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowEditModal(true)}
            >
              Edit Course
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(true)}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Delete Course
            </Button>
          </div>
        </div>

        {/* Course Details Card */}
        <Card className="overflow-hidden mb-6">
          <div className="p-8">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <p className="text-gray-900">{course.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created At</label>
                    <p className="text-gray-900">{formatDate(course.createdAt)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                    <p className="text-gray-900">{formatDate(course.updatedAt)}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Details</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Enrollment Status</label>
                    {course.isEnrolled !== undefined && (
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        course.isEnrolled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {course.isEnrolled ? 'Enrolled' : 'Not Enrolled'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line">{course.description}</p>
              </div>
            </div>

            {/* Enrollment Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Enrollment Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">{course.enrollmentCount}</div>
                  <div className="text-sm text-blue-800">Total Enrollments</div>
                </div>
                {course.userEnrollment && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-lg font-semibold text-green-600">{course.userEnrollment.status}</div>
                    <div className="text-sm text-green-800">Your Status</div>
                  </div>
                )}
                {course.enrolledUsers && (
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-600">{course.enrolledUsers.length}</div>
                    <div className="text-sm text-purple-800">Enrolled Students</div>
                  </div>
                )}
              </div>
              
              {/* Enrolled Users List */}
              {course.enrolledUsers && course.enrolledUsers.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Recent Enrolled Students</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {course.enrolledUsers.slice(0, 10).map((user) => (
                      <div key={user.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          {user.image ? (
                            <img src={user.image} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <span className="text-xs font-medium text-gray-600">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <div className="text-xs text-gray-400">
                          Enrolled: {formatDate(user.enrolledAt)}
                        </div>
                      </div>
                    ))}
                    {course.enrolledUsers.length > 10 && (
                      <div className="text-center py-2">
                        <span className="text-sm text-gray-500">
                          ... and {course.enrolledUsers.length - 10} more students
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Timestamps */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <label className="block font-medium">Created</label>
                  <p>{formatDate(course.createdAt)}</p>
                </div>
                <div>
                  <label className="block font-medium">Last Updated</label>
                  <p>{formatDate(course.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="default"
                onClick={() => setShowEditModal(true)}
              >
                Edit Course
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/admin/courses')}
              >
                View All Courses
              </Button>
            </div>
          </div>
        </Card>

        {/* Quiz Management Section */}
        <QuizList 
          ref={quizListRef}
          course={course}
          onCreateQuiz={() => setShowCreateQuizModal(true)}
        />

        {/* Modals */}
        {course && (
          <>
            <EditCourseModal
              isOpen={showEditModal}
              onClose={() => setShowEditModal(false)}
              course={course}
              onSuccess={handleEditSuccess}
            />
            <DeleteCourseModal
              isOpen={showDeleteModal}
              onClose={() => setShowDeleteModal(false)}
              course={course}
              onConfirm={handleDeleteCourse}
              onSuccess={handleDeleteSuccess}
            />
            <CreateQuizModal
              isOpen={showCreateQuizModal}
              onClose={() => setShowCreateQuizModal(false)}
              course={course}
              onSuccess={handleQuizCreateSuccess}
            />
          </>
        )}
      </div>
    </div>
  );
}