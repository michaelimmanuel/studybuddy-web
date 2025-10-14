"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import Button from "@/components/Button";
import CreatePackageModal from "./modals/CreatePackageModal";
import EditPackageModal from "./modals/EditPackageModal";
import DeletePackageModal from "./modals/DeletePackageModal";
import ManagePackageQuestionsModal from "./modals/ManagePackageQuestionsModal";
import api from "@/lib/api";
import { formatIDR } from "@/lib/utils";
import type { Package, GetPackagesResponse } from "@/types";

export default function PackageManagement() {
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await api.get<GetPackagesResponse>("/api/packages");
      setPackages(response.data);
    } catch (err) {
      setError("Failed to fetch packages");
      console.error("Fetch packages error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    fetchPackages();
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedPackage(null);
    fetchPackages();
  };

  const handleDeleteSuccess = () => {
    setShowDeleteModal(false);
    setSelectedPackage(null);
    fetchPackages();
  };

  const handleQuestionsSuccess = () => {
    setShowQuestionsModal(false);
    setSelectedPackage(null);
    fetchPackages();
  };

  const openEditModal = (pkg: Package) => {
    setSelectedPackage(pkg);
    setShowEditModal(true);
  };

  const openDeleteModal = (pkg: Package) => {
    setSelectedPackage(pkg);
    setShowDeleteModal(true);
  };

  const openQuestionsModal = (pkg: Package) => {
    setSelectedPackage(pkg);
    setShowQuestionsModal(true);
  };

  const togglePackageStatus = async (pkg: Package) => {
    try {
      await api.put(`/api/packages/${pkg.id}`, {
        isActive: !pkg.isActive
      });
      fetchPackages();
    } catch (err) {
      console.error("Failed to toggle package status:", err);
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
        <Button onClick={fetchPackages}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Package Management</h1>
          <p className="text-gray-600 mt-1">Create and manage question packages for sale</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          + Create Package
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600">{packages.length}</div>
          <div className="text-sm text-gray-600">Total Packages</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">
            {packages.filter(p => p.isActive).length}
          </div>
          <div className="text-sm text-gray-600">Active Packages</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-orange-600">
            {packages.filter(p => !p.isActive).length}
          </div>
          <div className="text-sm text-gray-600">Inactive Packages</div>
        </Card>
      </div>

      {/* Packages List */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">All Packages</h2>
        </div>
        
        {packages.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 text-4xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No packages yet</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first question package</p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create Your First Package
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Package
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Questions
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
                {packages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{pkg.title}</div>
                        {pkg.description && (
                          <div className="text-sm text-gray-500 mt-1 max-w-xs truncate">
                            {pkg.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatIDR(pkg.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {pkg.packageQuestions?.length || 0} questions
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          pkg.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {pkg.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(pkg.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                      <a
                        href={`/admin/packages/${pkg.id}/manage-questions`}
                        className="text-purple-600 hover:text-purple-900"
                        title="Manage Questions"
                      >
                        Questions
                      </a>
                      <button
                        onClick={() => togglePackageStatus(pkg)}
                        className={`${
                          pkg.isActive
                            ? "text-orange-600 hover:text-orange-900"
                            : "text-green-600 hover:text-green-900"
                        }`}
                        title={pkg.isActive ? "Deactivate" : "Activate"}
                      >
                        {pkg.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => openEditModal(pkg)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit Package"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteModal(pkg)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Package"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modals */}
      {showCreateModal && (
        <CreatePackageModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {showEditModal && selectedPackage && (
        <EditPackageModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedPackage(null);
          }}
          onSuccess={handleEditSuccess}
          package={selectedPackage}
        />
      )}

      {showDeleteModal && selectedPackage && (
        <DeletePackageModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedPackage(null);
          }}
          onSuccess={handleDeleteSuccess}
          package={selectedPackage}
        />
      )}

      {/* Removed ManagePackageQuestionsModal, now handled by dedicated page */}
    </div>
  );
}