"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import Button from "@/components/Button";
import CreateCourseModal from "./modals/CreateCourseModal";
import EditCourseModal from "./modals/EditCourseModal";
import DeleteCourseModal from "./modals/DeleteCourseModal";
import api from "@/lib/api";
import type { Course, PaginatedResponse } from "@/types";

export default function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 0,
    totalCourses: 0
  });

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const fetchCourses = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await api.get<{courses: Course[], pagination: any}>(
        `/api/courses?page=${page}&limit=${pagination.limit}`
      );
      
      setCourses(response.courses);
      setPagination(prev => ({
        ...prev,
        ...response.pagination
      }));
    } catch (err) {
      setError("Failed to fetch courses");
      console.error("Fetch courses error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreateCourse = async (courseData: { title: string; description: string }) => {
    try {
      await api.post("/api/courses", courseData);
      await fetchCourses(pagination.page); // Refresh current page
      setShowCreateModal(false);
    } catch (err) {
      console.error("Create course error:", err);
      throw err; // Re-throw to let modal handle the error
    }
  };

  const handleEditCourse = async (courseData: { title: string; description: string }) => {
    if (!selectedCourse) return;
    
    try {
      await api.put(`/api/courses/${selectedCourse.id}`, courseData);
      await fetchCourses(pagination.page); // Refresh current page
      setShowEditModal(false);
      setSelectedCourse(null);
    } catch (err) {
      console.error("Edit course error:", err);
      throw err; // Re-throw to let modal handle the error
    }
  };

  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;
    
    try {
      await api.del(`/api/courses/${selectedCourse.id}`);
      await fetchCourses(pagination.page); // Refresh current page
      setShowDeleteModal(false);
      setSelectedCourse(null);
    } catch (err) {
      console.error("Delete course error:", err);
      throw err; // Re-throw to let modal handle the error
    }
  };

  const openEditModal = (course: Course) => {
    setSelectedCourse(course);
    setShowEditModal(true);
  };

  const openDeleteModal = (course: Course) => {
    setSelectedCourse(course);
    setShowDeleteModal(true);
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    fetchCourses(newPage);
  };

  if (loading && courses.length === 0) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Course Management</h2>
        <Button onClick={() => setShowCreateModal(true)}>
          Create New Course
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <Card className="p-6">
        {courses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No courses found</p>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="mt-4"
            >
              Create Your First Course
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Course List */}
            <div className="space-y-3">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{course.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>{course.enrollmentCount} enrollments</span>
                      <span>Created {new Date(course.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(course)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDeleteModal(course)}
                      className="text-red-600 hover:text-red-700 hover:border-red-300"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-between items-center pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Showing {courses.length} of {pagination.totalCourses} courses
                </p>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </Button>
                  <span className="px-3 py-1 text-sm text-gray-600">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
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
      </Card>

      {/* Modals */}
      <CreateCourseModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateCourse}
      />

      <EditCourseModal
        isOpen={showEditModal}
        course={selectedCourse}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCourse(null);
        }}
        onSubmit={handleEditCourse}
      />

      <DeleteCourseModal
        isOpen={showDeleteModal}
        course={selectedCourse}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedCourse(null);
        }}
        onConfirm={handleDeleteCourse}
      />
    </div>
  );
}