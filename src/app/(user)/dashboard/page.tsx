"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api, { ApiError, clearToken } from "@/lib/api";

type User = {
    user : {
        id: string;
        name?: string;
        email?: string;
    }
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchProfile() {
      setLoading(true);
      setError(null);
      try {
        const profile = await api.get<User>("/api/users/me", { timeout: 10 });
        console.log('Fetched profile:', profile);
        if (mounted) setUser(profile);
      } catch (err) {
        if (err instanceof ApiError) setError(err.data?.message ?? err.message);
        else if (err instanceof Error) setError(err.message);
        else setError("Failed to fetch profile");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchProfile();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleLogout() {
    try {
      await api.del("api/auth/logout");
    } catch (err) {
      // ignore errors on logout
    }
    clearToken();
    router.push("/login"); // Fixed: changed from /auth/login to /login
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {loading ? (
        <div>Loading profile…</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 md:col-span-2 bg-white rounded-lg p-6 shadow">
            <h2 className="text-xl font-semibold mb-2">Welcome{user?.user.name ? `, ${user.user.name}` : ''}!</h2>
            <p className="text-gray-600">This is a simple dashboard. You can fetch protected data from your API here.</p>

            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded text-center">
                <div className="text-2xl font-bold">12.5k+</div>
                <div className="text-sm text-gray-600">Users</div>
              </div>
              <div className="p-4 bg-green-50 rounded text-center">
                <div className="text-2xl font-bold">320+</div>
                <div className="text-sm text-gray-600">Tryouts</div>
              </div>
              <div className="p-4 bg-green-50 rounded text-center">
                <div className="text-2xl font-bold">2.1k+</div>
                <div className="text-sm text-gray-600">Alumni</div>
              </div>
            </div>
          </div>

          <div className="col-span-1 bg-white rounded-lg p-6 shadow">
            <h3 className="text-lg font-semibold mb-2">Profile</h3>
            <div className="text-sm text-gray-700">
              <div><strong>ID:</strong> {user?.user.id}</div>
              <div><strong>Name:</strong> {user?.user.name ?? '-'}</div>
              <div><strong>Email:</strong> {user?.user.email ?? '-'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
