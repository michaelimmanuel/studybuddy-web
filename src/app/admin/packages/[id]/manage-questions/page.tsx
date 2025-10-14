"use client";


import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import api from "@/lib/api";
import type { Package, Question, Course } from "@/types";

export default function ManagePackageQuestionsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const packageId = params.id;
  const [pkg, setPkg] = useState<Package | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"current" | "add">("current");
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [selectedQuestionsToAdd, setSelectedQuestionsToAdd] = useState<string[]>([]);
  const [selectedQuestionsToRemove, setSelectedQuestionsToRemove] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  // Random question add state
  const [showRandom, setShowRandom] = useState(false);
  const [randomCourseId, setRandomCourseId] = useState("");
  const [randomCount, setRandomCount] = useState(10);

  // Handler for adding random questions
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
      await api.post(`/api/packages/${packageId}/questions/random`, {
        courseId: randomCourseId,
        count: randomCount,
      });
      setShowRandom(false);
      setRandomCourseId("");
      setRandomCount(10);
      setSelectedCourse("");
      setSelectedQuestionsToAdd([]);
      // Refresh package data to update the UI immediately
      const response = await api.get<{ data: Package }>(`/api/packages/${packageId}`);
      setPkg(response.data);
    } catch (err: any) {
      setError(err.data?.message || "Failed to add random questions");
    } finally {
      setLoading(false);
    }
  };

  // Fetch package details
  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const response = await api.get<{ data: Package }>(`/api/packages/${packageId}`);
        setPkg(response.data);
      } catch (err) {
        setError("Failed to fetch package");
      }
    };
    fetchPackage();
  }, [packageId]);

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get<{ courses: Course[] }>("/api/courses?limit=100&page=1");
        setCourses(response.courses || []);
      } catch (err) {
        setError("Failed to fetch courses");
      }
    };
    fetchCourses();
  }, []);

  // Fetch available questions for selected course
  useEffect(() => {
    if (!selectedCourse) return;
    const fetchAvailableQuestions = async () => {
      setLoading(true);
      try {
        const response = await api.get<{ questions: Question[] }>(`/api/courses/${selectedCourse}/questions?limit=100&page=1`);
        setAvailableQuestions(response.questions || []);
      } catch (err) {
        setError("Failed to fetch questions");
      } finally {
        setLoading(false);
      }
    };
    fetchAvailableQuestions();
  }, [selectedCourse]);

  // Add questions to package
  const handleAddQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.post(`/api/packages/${packageId}/questions`, { questionIds: selectedQuestionsToAdd });
      setSelectedQuestionsToAdd([]);
      router.refresh();
    } catch (err: any) {
      setError(err.data?.message || "Failed to add questions");
    } finally {
      setLoading(false);
    }
  };

  // Remove questions from package (bulk delete)
  const handleRemoveQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.del(`/api/packages/${packageId}/questions`, { questionIds: selectedQuestionsToRemove });
      setSelectedQuestionsToRemove([]);
      // Refresh package data to update the UI immediately
      const response = await api.get<{ data: Package }>(`/api/packages/${packageId}`);
      setPkg(response.data);
    } catch (err: any) {
      setError(err.data?.message || "Failed to remove questions");
    } finally {
      setLoading(false);
    }
  };


  if (!pkg) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      <span className="ml-4 text-lg">Loading package...</span>
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Manage Questions for Package: <span className="text-blue-700">{pkg.title}</span></h1>
      <div className="mb-6 flex gap-2 border-b border-gray-200">
        <button
          className={`px-4 py-2 font-medium border-b-2 transition-colors duration-150 ${tab === "current" ? "border-blue-600 text-blue-700" : "border-transparent text-gray-500 hover:text-blue-600"}`}
          onClick={() => setTab("current")}
        >
          Current Questions
        </button>
        <button
          className={`px-4 py-2 font-medium border-b-2 transition-colors duration-150 ${tab === "add" ? "border-blue-600 text-blue-700" : "border-transparent text-gray-500 hover:text-blue-600"}`}
          onClick={() => setTab("add")}
        >
          Add Questions
        </button>
      </div>

      {tab === "current" && (
        <section>
          <h2 className="text-lg font-semibold mb-2">Current Questions</h2>
          {pkg.packageQuestions?.length === 0 ? (
            <div className="text-gray-500 italic mb-4">No questions in this package yet.</div>
          ) : (
            <ul className="divide-y divide-gray-100 mb-4">
              {pkg.packageQuestions?.map((pq) => (
                <li key={pq.question.id} className="py-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedQuestionsToRemove.includes(pq.question.id)}
                      onChange={(e) => {
                        setSelectedQuestionsToRemove((prev) =>
                          e.target.checked
                            ? [...prev, pq.question.id]
                            : prev.filter((id) => id !== pq.question.id)
                        );
                      }}
                    />
                    <span className="flex-1 font-medium">{pq.question.text}</span>
                  </div>
                  {pq.question.answers && pq.question.answers.length > 0 && (
                    <ul className="ml-8 mt-2 space-y-1">
                      {pq.question.answers.map((ans, idx) => (
                        <li
                          key={ans.id}
                          className={`flex items-center gap-2 px-2 py-1 rounded ${ans.isCorrect ? "bg-green-100 text-green-800 font-semibold" : "bg-gray-50 text-gray-700"}`}
                        >
                          <span className="w-6 text-xs text-center">
                            {ans.isCorrect ? "✔" : String.fromCharCode(65 + idx)}
                          </span>
                          <span>{ans.text}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
          <Button onClick={handleRemoveQuestions} disabled={loading || selectedQuestionsToRemove.length === 0}>
            {loading ? <span className="animate-spin mr-2">⏳</span> : null} Remove Selected
          </Button>
        </section>
      )}

      {tab === "add" && (
        <section>
          <h2 className="text-lg font-semibold mb-2">Add Questions</h2>
          <div className="mb-4 flex items-center gap-2">
            <label htmlFor="course" className="font-medium">Filter by Course:</label>
            <select
              id="course"
              className="border rounded px-2 py-1"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          {/* Add Random Questions Section */}
          <div className="border border-dashed rounded-md p-4 bg-gray-50 mb-4">
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
                    disabled={loading}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {loading ? <span className="animate-spin mr-2">⏳</span> : null} Add Random Questions
                  </Button>
                </div>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-blue-600"><span className="animate-spin">⏳</span> Loading questions...</div>
          ) : availableQuestions.length === 0 && selectedCourse ? (
            <div className="text-gray-500 italic mb-4">No available questions for this course.</div>
          ) : (
            <ul className="divide-y divide-gray-100 mb-4">
              {availableQuestions.map((q) => (
                <li key={q.id} className="flex items-center gap-2 py-2">
                  <input
                    type="checkbox"
                    checked={selectedQuestionsToAdd.includes(q.id)}
                    onChange={(e) => {
                      setSelectedQuestionsToAdd((prev) =>
                        e.target.checked
                          ? [...prev, q.id]
                          : prev.filter((id) => id !== q.id)
                      );
                    }}
                  />
                  <span className="flex-1">{q.text}</span>
                </li>
              ))}
            </ul>
          )}
          <Button onClick={handleAddQuestions} disabled={loading || selectedQuestionsToAdd.length === 0}>
            {loading ? <span className="animate-spin mr-2">⏳</span> : null} Add Selected
          </Button>
        </section>
      )}

      {error && <div className="text-red-500 mt-4">{error}</div>}
    </div>
  );
}
