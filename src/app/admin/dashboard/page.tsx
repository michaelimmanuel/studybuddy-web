import DashboardOverview from "@/components/admin/DashboardOverview";
import CourseManagement from "@/components/admin/CourseManagement";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your StudyBuddy platform</p>
        </div>
        
        <div className="space-y-8">
          <DashboardOverview />
          <CourseManagement />
        </div>
      </div>
    </div>
  );
}
