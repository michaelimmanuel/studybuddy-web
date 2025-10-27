"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import Button from "@/components/Button";
import PracticeQuestions from "@/components/PracticeQuestions";
import QuestionBank from "@/components/admin/QuestionBank";
import type { Course, GetCourseByIdResponse } from "@/types";
import api from "@/lib/api";

export default function UserCoursePage() {
  const params = useParams();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'practice'>('overview');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await api.get<GetCourseByIdResponse>(`/api/courses/${courseId}`);
        setCourse(response.course);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to fetch course");
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading course...</span>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-red-600">{error || "Course not found"}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Course Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
          <p className="text-blue-100 text-lg">{course.description}</p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'questions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Question Bank
            </button>
            <button
              onClick={() => setActiveTab('practice')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'practice'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Practice Questions
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-96">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Course Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">About This Course</h3>
                    <p className="text-gray-600">{course.description}</p>
                  </div>
                  
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => setActiveTab('practice')}>
                    Start Practice Questions
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab('questions')}>
                    Browse Question Bank
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'questions' && (
            <QuestionBank 
              course={course}
              onCreateQuestion={() => {}}
              userRole="student"
            />
          )}

          {activeTab === 'practice' && (
            <PracticeQuestions courseId={course.id} />
          )}
        </div>
      </div>
    </div>
  );
}