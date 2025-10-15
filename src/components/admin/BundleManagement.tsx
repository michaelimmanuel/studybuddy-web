"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import Button from "@/components/Button";
import api from "@/lib/api";
import { formatIDR } from "@/lib/utils";
import type { Bundle, GetBundlesResponse } from "@/types";
import CreateBundleModal from "./modals/CreateBundleModal";
import EditBundleModal from "./modals/EditBundleModal";
import DeleteBundleModal from "./modals/DeleteBundleModal";
import ManageBundlePackagesModal from "./modals/ManageBundlePackagesModal";

export default function BundleManagement() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editBundle, setEditBundle] = useState<Bundle | null>(null);
  const [deleteBundle, setDeleteBundle] = useState<Bundle | null>(null);
  const [managePackagesBundle, setManagePackagesBundle] = useState<Bundle | null>(null);
  const [statusLoading, setStatusLoading] = useState<string | null>(null);

  const fetchBundles = async () => {
    try {
      setLoading(true);
      const response = await api.get<GetBundlesResponse>("/api/bundles");
      setBundles(response.data);
    } catch (err) {
      setError("Failed to fetch bundles");
      console.error("Fetch bundles error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBundles();
  }, []);

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    fetchBundles();
  };
  const handleEditSuccess = () => {
    setEditBundle(null);
    fetchBundles();
  };
  const handleDeleteSuccess = () => {
    setDeleteBundle(null);
    fetchBundles();
  };
  const handleManagePackagesSuccess = () => {
    setManagePackagesBundle(null);
    fetchBundles();
  };
  const handleToggleStatus = async (bundle: Bundle) => {
    setStatusLoading(bundle.id);
    try {
      await api.put(`/api/bundles/${bundle.id}`, { isActive: !bundle.isActive });
      fetchBundles();
    } catch {
      // Optionally show error
    } finally {
      setStatusLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchBundles}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bundle Management</h1>
          <p className="text-gray-600 mt-1">Create and manage bundles of packages for sale</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          + Create Bundle
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600">{bundles.length}</div>
          <div className="text-sm text-gray-600">Total Bundles</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">
            {bundles.filter(b => b.isActive).length}
          </div>
          <div className="text-sm text-gray-600">Active Bundles</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-orange-600">
            {bundles.filter(b => !b.isActive).length}
          </div>
          <div className="text-sm text-gray-600">Inactive Bundles</div>
        </Card>
      </div>

  {/* Create Bundle Modal */}
  <CreateBundleModal open={showCreateModal} onClose={() => setShowCreateModal(false)} onSuccess={handleCreateSuccess} />
  {editBundle && (
    <EditBundleModal open={true} onClose={() => setEditBundle(null)} bundle={editBundle} onSuccess={handleEditSuccess} />
  )}
  {deleteBundle && (
    <DeleteBundleModal open={true} onClose={() => setDeleteBundle(null)} bundle={deleteBundle} onSuccess={handleDeleteSuccess} />
  )}
  {managePackagesBundle && (
    <ManageBundlePackagesModal open={true} onClose={() => setManagePackagesBundle(null)} bundle={managePackagesBundle} onSuccess={handleManagePackagesSuccess} />
  )}

  {/* Bundles List */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">All Bundles</h2>
        </div>
        {bundles.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 text-4xl mb-4">🎁</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bundles yet</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first bundle</p>
            <Button
              onClick={() => {}}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create Your First Bundle
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bundle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Packages
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bundles.map((bundle) => (
                  <tr key={bundle.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{bundle.title}</div>
                        {bundle.description && (
                          <div className="text-sm text-gray-500 mt-1 max-w-xs truncate">
                            {bundle.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatIDR(bundle.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {bundle.stats?.packagesCount ?? bundle.bundlePackages?.length ?? 0} packages
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          bundle.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {bundle.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(bundle.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                      <button
                        onClick={() => setEditBundle(bundle)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit Bundle"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteBundle(bundle)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Bundle"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setManagePackagesBundle(bundle)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Manage Packages"
                      >
                        Packages
                      </button>
                      <button
                        onClick={() => handleToggleStatus(bundle)}
                        className={`ml-2 ${bundle.isActive ? "text-gray-500 hover:text-gray-700" : "text-green-600 hover:text-green-900"}`}
                        disabled={statusLoading === bundle.id}
                        title={bundle.isActive ? "Deactivate" : "Activate"}
                      >
                        {statusLoading === bundle.id ? "..." : bundle.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
