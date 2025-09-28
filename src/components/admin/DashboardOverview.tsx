"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import api from "@/lib/api";
import type { UserStats, CourseStatsResponse } from "@/types";

export default function DashboardOverview() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [courseStats, setCourseStats] = useState<CourseStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const [userStatsResponse, courseStatsResponse] = await Promise.all([
          api.get<{ stats: UserStats }>("/api/users/stats"),
          api.get<CourseStatsResponse>("/api/courses/stats")
        ]);

        setUserStats(userStatsResponse.stats);
        setCourseStats(courseStatsResponse);
      } catch (err) {
        setError("Failed to fetch dashboard statistics");
        console.error("Dashboard stats error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Overview</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <Card className="p-6">
          <div className="flex items-center">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-blue-600">
                {userStats?.totalUsers || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {userStats?.verificationRate}% verified
              </p>
            </div>
          </div>
        </Card>

        {/* Total Courses */}
        <Card className="p-6">
          <div className="flex items-center">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-3xl font-bold text-green-600">
                {courseStats?.stats.totalCourses || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Avg {courseStats?.stats.averageEnrollmentsPerCourse || 0} enrollments
              </p>
            </div>
          </div>
        </Card>

        {/* Total Enrollments */}
        <Card className="p-6">
          <div className="flex items-center">
            <div>
              <p className="text-sm font-medium text-gray-600">Enrollments</p>
              <p className="text-3xl font-bold text-purple-600">
                {courseStats?.stats.totalEnrollments || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {courseStats?.stats.approvedEnrollments || 0} approved
              </p>
            </div>
          </div>
        </Card>

        {/* Pending Enrollments */}
        <Card className="p-6">
          <div className="flex items-center">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-orange-600">
                {courseStats?.stats.pendingEnrollments || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Need approval
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Popular Courses */}
      {courseStats?.popularCourses && courseStats.popularCourses.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Courses</h3>
          <div className="space-y-3">
            {courseStats.popularCourses.slice(0, 5).map((course) => (
              <div key={course.id} className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">
                  {course.title}
                </span>
                <span className="text-sm text-gray-500">
                  {course.enrollmentCount} enrollments
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}