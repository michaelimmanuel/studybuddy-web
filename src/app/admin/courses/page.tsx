"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import type { Course, PaginatedResponse, GetAllCoursesResponse } from "@/types";

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    totalPages: 0,
    totalCourses: 0
  });

  const fetchCourses = async (page: number = 1, search?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });
      
      if (search) {
        params.append('search', search);
      }

      const response = await api.get<GetAllCoursesResponse>(`/api/courses?${params}`);
      
      // Handle the API response structure
      const coursesData = response.courses || [];
      const paginationData = response.pagination || {
        page: 1,
        totalPages: 1,
        totalCourses: coursesData.length
      };
      
      setCourses(coursesData);
      setPagination(prev => ({
        ...prev,
        page: paginationData.page,
        totalPages: paginationData.totalPages,
        totalCourses: paginationData.totalCourses || 0
      }));
      setError(null);
    } catch (err: any) {
      console.error('Error fetching courses:', err);
      setError(err.message || "Failed to fetch courses");
      setCourses([]); // Ensure courses is always an array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses(1, searchTerm);
  }, []);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchCourses(1, searchTerm);
  };

  const handlePageChange = (newPage: number) => {
    fetchCourses(newPage, searchTerm);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading && courses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6 space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Courses</h1>
              <p className="text-gray-600 mt-2">
                Total: {pagination.totalCourses} courses
              </p>
            </div>
            <Button 
              variant="default" 
              onClick={() => router.push('/admin/dashboard')}
            >
              Back to Dashboard
            </Button>
          </div>

          {/* Search Bar */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <Button variant="default" onClick={handleSearch}>
              Search
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {courses && courses.length > 0 && courses.map((course) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              <div 
                onClick={() => router.push(`/admin/courses/${course.id}`)}
                className="p-6"
              >
                {/* Course Info */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                      {course.title}
                    </h3>
                  </div>

                  <p className="text-gray-600 text-sm line-clamp-3">
                    {course.description}
                  </p>

                  {/* Enrollment Count */}
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{course.enrollmentCount} enrolled</span>
                    {course.isEnrolled !== undefined && (
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        course.isEnrolled 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {course.isEnrolled ? 'Enrolled' : 'Not Enrolled'}
                      </span>
                    )}
                  </div>

                  {/* Created Date */}
                  <div className="text-xs text-gray-400">
                    Created: {formatDate(course.createdAt)}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {(!courses || courses.length === 0) && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Try adjusting your search terms.' : 'No courses have been created yet.'}
            </p>
            <Button 
              variant="default" 
              onClick={() => router.push('/admin/dashboard')}
            >
              Go to Dashboard
            </Button>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            
            <div className="flex items-center space-x-2">
              {[...Array(pagination.totalPages)].map((_, i) => {
                const page = i + 1;
                const isCurrentPage = page === pagination.page;
                const showPage = 
                  page === 1 || 
                  page === pagination.totalPages || 
                  Math.abs(page - pagination.page) <= 1;

                if (!showPage) {
                  if (page === pagination.page - 2 || page === pagination.page + 2) {
                    return <span key={page} className="text-gray-400">...</span>;
                  }
                  return null;
                }

                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded ${
                      isCurrentPage
                        ? 'bg-green-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}