"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import Button from "@/components/Button";
import api from "@/lib/api";
import type { Package } from "@/types";

export default function QuizPackagesPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ success: boolean; data: Package[] }>("/api/packages");
      
      // Filter active packages that user has access to
      const activePackages = response.data.filter((pkg: Package) => pkg.isActive);
      setPackages(activePackages);
    } catch (err: any) {
      setError(err.message || "Failed to fetch quiz packages");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes: number | undefined) => {
    if (!minutes) return "No time limit";
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const isPackageAvailable = (pkg: Package) => {
    const now = new Date();
    if (pkg.availableFrom && new Date(pkg.availableFrom) > now) return false;
    if (pkg.availableUntil && new Date(pkg.availableUntil) < now) return false;
    return true;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-gray-600">Loading quizzes...</span>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Available Quizzes</h1>
        <p className="text-gray-600 mt-2">Choose a quiz package to test your knowledge</p>
      </div>

      {error && (
        <Card className="p-4 mb-6 bg-red-50 border-red-200">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      {packages.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Quizzes Available</h3>
            <p className="text-gray-600">
              There are currently no quiz packages available. Check back later or contact your administrator.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => {
            const available = isPackageAvailable(pkg);
            const questionCount = pkg.packageQuestions?.length || 0;

            return (
              <Card key={pkg.id} className={`p-6 hover:shadow-lg transition-shadow ${!available ? 'opacity-60' : ''}`}>
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{pkg.title}</h3>
                    
                    {pkg.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{pkg.description}</p>
                    )}

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{questionCount} question{questionCount !== 1 ? 's' : ''}</span>
                      </div>

                      {pkg.timeLimit && (
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{formatTime(pkg.timeLimit)}</span>
                        </div>
                      )}

                      {pkg.price > 0 && (
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-5 h-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>${pkg.price.toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    {!available && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-yellow-800">
                          {pkg.availableFrom && new Date(pkg.availableFrom) > new Date() 
                            ? `Available from ${new Date(pkg.availableFrom).toLocaleDateString()}`
                            : 'No longer available'}
                        </p>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => router.push(`/quiz/${pkg.id}`)}
                    disabled={!available || questionCount === 0}
                    className="w-full mt-4"
                  >
                    {questionCount === 0 ? 'No Questions' : 'Start Quiz'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
