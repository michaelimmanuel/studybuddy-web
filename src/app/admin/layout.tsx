"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdminAuth() {
      try {
        // First check if user is authenticated
        await api.get("/api/users/me");
        setIsAuthenticated(true);

        // Then check admin status - your endpoint returns a boolean
        const isAdminResponse = await api.get<any>("/api/users/is-admin");
        console.log("Admin check response:", isAdminResponse);
        
        if (isAdminResponse.isAdmin === true) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          // Redirect non-admin users to their dashboard
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Admin auth check failed:", error);
        setIsAuthenticated(false);
        // Redirect unauthenticated users to login
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    checkAdminAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have admin privileges to access this area.</p>
          <button 
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                User Dashboard
              </button>
              <button
                onClick={async () => {
                  try {
                    await api.del("/api/auth/logout");
                  } catch {
                    // ignore errors on logout
                  }
                  localStorage.removeItem("token");
                  router.push("/login");
                }}
                className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => router.push("/admin")}
              className="py-3 px-1 border-b-2 border-transparent hover:border-blue-500 text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              Overview
            </button>
            <button
              onClick={() => router.push("/admin/users")}
              className="py-3 px-1 border-b-2 border-transparent hover:border-blue-500 text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              User Management
            </button>
            <button
              onClick={() => router.push("/admin/courses")}
              className="py-3 px-1 border-b-2 border-transparent hover:border-blue-500 text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              Question Banks
            </button>
            <button
              onClick={() => router.push("/admin/packages")}
              className="py-3 px-1 border-b-2 border-transparent hover:border-blue-500 text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              Packages
            </button>
            <button
              onClick={() => router.push("/admin/bundles")}
              className="py-3 px-1 border-b-2 border-transparent hover:border-blue-500 text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              Bundles
            </button>
            <button
              onClick={() => router.push("/admin/analytics")}
              className="py-3 px-1 border-b-2 border-transparent hover:border-blue-500 text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              Analytics
            </button>
            <button
              onClick={() => router.push("/admin/settings")}
              className="py-3 px-1 border-b-2 border-transparent hover:border-blue-500 text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              Settings
            </button>
          </div>
        </div>
      </nav>

      {/* Admin Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}