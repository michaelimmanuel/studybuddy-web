"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal";
import Button from "@/components/Button";
import api from "@/lib/api";
import type { 
  Package, 
  Question, 
  Course,
  GetCourseQuestionsResponse,
  AddQuestionsToPackageResponse,
  RemoveQuestionsFromPackageResponse 
} from "@/types";
import type { AddRandomQuestionsFromCourseResponse } from "@/types";

interface ManagePackageQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  package: Package;
}

export default function ManagePackageQuestionsModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  package: pkg 
}: ManagePackageQuestionsModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"current" | "add">("current");
  const [showRandom, setShowRandom] = useState(false);
  
  // Available questions to add
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [availableLoading, setAvailableLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [randomCourseId, setRandomCourseId] = useState<string>("");
  const [randomCount, setRandomCount] = useState<number>(10);
  
  // Selected questions for operations
  const [selectedQuestionsToAdd, setSelectedQuestionsToAdd] = useState<string[]>([]);
  const [selectedQuestionsToRemove, setSelectedQuestionsToRemove] = useState<string[]>([]);

  // Fetch courses for filtering
  const fetchCourses = async () => {
    try {
      const response = await api.get<{courses: Course[]}>("/api/courses?limit=100&page=1");
      setCourses(response.courses || []);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    }
  };

  // Fetch available questions (not in package) for a specific course
  const fetchAvailableQuestions = async (courseId?: string) => {
    if (!courseId) {
      setAvailableQuestions([]);
      return;
    }
    setAvailableLoading(true);
    try {
      const response = await api.get<GetCourseQuestionsResponse>(`/api/courses/${courseId}/questions?limit=100&page=1`);
      const allQuestions = response.questions || [];
      
      // Filter out questions already in package
      const currentQuestionIds = pkg.packageQuestions?.map(pq => pq.questionId) || [];
      const available = allQuestions.filter((q: Question) => !currentQuestionIds.includes(q.id));
      
      setAvailableQuestions(available);
    } catch (err) {
      console.error("Failed to fetch course questions:", err);
      setError("Failed to load questions for the selected course");
    } finally {
      setAvailableLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCourses();
    }
  }, [isOpen]);

  // Load questions when course filter changes
  useEffect(() => {
    if (isOpen) {
      fetchAvailableQuestions(selectedCourse);
    }
  }, [isOpen, selectedCourse, pkg.id]);

  const handleAddQuestions = async () => {
    if (selectedQuestionsToAdd.length === 0) {
      setError("Please select at least one question to add");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post<AddQuestionsToPackageResponse>(
        `/api/packages/${pkg.id}/questions`,
        { questionIds: selectedQuestionsToAdd }
      );
      
      setSelectedQuestionsToAdd([]);
      onSuccess();
    } catch (err: any) {
      setError(err.data?.message || "Failed to add questions to package");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveQuestions = async () => {
    if (selectedQuestionsToRemove.length === 0) {
      setError("Please select at least one question to remove");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.del<RemoveQuestionsFromPackageResponse>(
        `/api/packages/${pkg.id}/questions`,
        { body: { questionIds: selectedQuestionsToRemove } }
      );
      
      setSelectedQuestionsToRemove([]);
      onSuccess();
    } catch (err: any) {
      setError(err.data?.message || "Failed to remove questions from package");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSelectedQuestionsToAdd([]);
      setSelectedQuestionsToRemove([]);
      setSearchTerm("");
      setSelectedCourse("");
      setRandomCourseId("");
      setRandomCount(10);
      setShowRandom(false);
      setError(null);
      setTab("current");
      onClose();
    }
  };

  const handleAddRandom = async () => {
    if (!randomCourseId) {
      setError("Please select a course for random selection");
      return;
    }
    if (!Number.isInteger(randomCount) || randomCount < 1 || randomCount > 200) {
      setError("Count must be an integer between 1 and 200");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<AddRandomQuestionsFromCourseResponse>(
        `/api/packages/${pkg.id}/questions/random`,
        { courseId: randomCourseId, count: randomCount }
      );
      // refresh available and parent
      await fetchAvailableQuestions();
      onSuccess();
      setShowRandom(false);
    } catch (err: any) {
      setError(err.data?.message || "Failed to add random questions");
    } finally {
      setLoading(false);
    }
  };

  // Filter available questions based on search and course
  const filteredAvailableQuestions = availableQuestions.filter(question => {
    const matchesSearch = question.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.course?.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = !selectedCourse || question.courseId === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const footer = (
    <div className="flex justify-between">
      <div className="text-sm text-gray-500">
        {tab === "current" && (
          <span>
            {pkg.packageQuestions?.length || 0} questions in package
            {selectedQuestionsToRemove.length > 0 && 
              `, ${selectedQuestionsToRemove.length} selected for removal`
            }
          </span>
        )}
        {tab === "add" && (
          <span>
            {filteredAvailableQuestions.length} available questions
            {selectedQuestionsToAdd.length > 0 && 
              `, ${selectedQuestionsToAdd.length} selected to add`
            }
          </span>
        )}
      </div>
      <div className="flex space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleClose}
          disabled={loading}
        >
          Close
        </Button>
        {tab === "current" && selectedQuestionsToRemove.length > 0 && (
          <Button
            type="button"
            onClick={handleRemoveQuestions}
            loading={loading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Remove Selected ({selectedQuestionsToRemove.length})
          </Button>
        )}
        {tab === "add" && selectedQuestionsToAdd.length > 0 && (
          <Button
            type="button"
            onClick={handleAddQuestions}
            loading={loading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Add Selected ({selectedQuestionsToAdd.length})
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Manage Questions: ${pkg.title}`}
      footer={footer}
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-600">{error}</div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setTab("current")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                tab === "current"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Current Questions ({pkg.packageQuestions?.length || 0})
            </button>
            <button
              onClick={() => setTab("add")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                tab === "add"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Add Questions
            </button>
          </nav>
        </div>

        {/* Current Questions Tab */}
        {tab === "current" && (
          <div className="space-y-4">
            {pkg.packageQuestions && pkg.packageQuestions.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-700">
                    Questions in Package
                  </h3>
                  <div className="text-sm text-gray-500">
                    Select questions to remove
                  </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                  {pkg.packageQuestions
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((pq, index) => (
                    <div key={pq.id} className="p-3 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedQuestionsToRemove.includes(pq.questionId)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedQuestionsToRemove([...selectedQuestionsToRemove, pq.questionId]);
                            } else {
                              setSelectedQuestionsToRemove(
                                selectedQuestionsToRemove.filter(id => id !== pq.questionId)
                              );
                            }
                          }}
                          className="mt-1 rounded border-gray-300 text-red-600"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 font-mono">
                              #{index + 1}
                            </span>
                            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                              {pq.question.course?.title}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900 mt-1">
                            {pq.question.text}
                          </p>
                          {pq.question.explanation && (
                            <p className="text-xs text-gray-600 mt-1">
                              Explanation: {pq.question.explanation}
                            </p>
                          )}
                          <div className="text-xs text-gray-500 mt-1">
                            {pq.question.answers?.length || 0} answers
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">❓</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No questions in package</h3>
                <p className="text-gray-600 mb-4">Add questions to this package to get started</p>
                <Button
                  onClick={() => setTab("add")}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Add Questions
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Add Questions Tab */}
        {tab === "add" && (
          <div className="space-y-4">
            {/* Search and Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search Questions
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search by question text or course..."
                />
              </div>
              <div>
                <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Course
                </label>
                <select
                  id="course"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Courses</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Add Random Section */}
            <div className="border border-dashed rounded-md p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-800">Add Random Questions From Course</h4>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-800"
                  onClick={() => setShowRandom(!showRandom)}
                >
                  {showRandom ? "Hide" : "Show"}
                </button>
              </div>
              {showRandom && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div className="md:col-span-2">
                    <label htmlFor="random-course" className="block text-sm font-medium text-gray-700 mb-1">
                      Select Course
                    </label>
                    <select
                      id="random-course"
                      value={randomCourseId}
                      onChange={(e) => setRandomCourseId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Choose a course...</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="random-count" className="block text-sm font-medium text-gray-700 mb-1">
                      Count
                    </label>
                    <input
                      type="number"
                      id="random-count"
                      value={randomCount}
                      min={1}
                      max={200}
                      onChange={(e) => setRandomCount(parseInt(e.target.value || '0', 10))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <Button
                      type="button"
                      onClick={handleAddRandom}
                      loading={loading}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Add Random Questions
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Available Questions */}
            {selectedCourse === "" ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">📘</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a course</h3>
                <p className="text-gray-600">Choose a course above to load its questions</p>
              </div>
            ) : availableLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-700">
                    Available Questions ({filteredAvailableQuestions.length})
                  </h3>
                  <div className="text-sm text-gray-500">
                    Select questions to add
                  </div>
                </div>
                
                {filteredAvailableQuestions.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                    {filteredAvailableQuestions.map((question) => (
                      <div key={question.id} className="p-3 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedQuestionsToAdd.includes(question.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedQuestionsToAdd([...selectedQuestionsToAdd, question.id]);
                              } else {
                                setSelectedQuestionsToAdd(
                                  selectedQuestionsToAdd.filter(id => id !== question.id)
                                );
                              }
                            }}
                            className="mt-1 rounded border-gray-300 text-green-600"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                {question.course?.title}
                              </span>
                            </div>
                            <p className="text-sm text-gray-900 mt-1">
                              {question.text}
                            </p>
                            {question.explanation && (
                              <p className="text-xs text-gray-600 mt-1">
                                Explanation: {question.explanation}
                              </p>
                            )}
                            <div className="text-xs text-gray-500 mt-1">
                              {question.answers?.length || 0} answers
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-4">🔍</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
                    <p className="text-gray-600">
                      {searchTerm || selectedCourse 
                        ? "Try adjusting your search or filter criteria"
                        : "All available questions are already in this package"
                      }
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}