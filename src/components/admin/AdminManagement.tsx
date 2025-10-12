'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, UserPlus, Shield, ShieldOff, Eye, EyeOff } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { api } from '@/lib/api';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: string;
  banned: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AdminUsersResponse {
  adminUsers: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalAdminUsers: number;
  };
}

interface CreateAdminData {
  name: string;
  email: string;
  password: string;
}

export default function AdminManagement() {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalAdminUsers: 0
  });
  
  const [newAdmin, setNewAdmin] = useState<CreateAdminData>({
    name: '',
    email: '',
    password: ''
  });

  const { toast } = useToast();

  // Fetch admin users
  const fetchAdminUsers = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.get<AdminUsersResponse>(`/api/users/admins?page=${page}&limit=10`);
      
      console.log('API Response:', response); // Debug log
      
      // The API returns the data directly, not nested in a 'data' property
      setAdminUsers(response.adminUsers);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching admin users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch admin users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create new admin
  const createAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreating(true);
      await api.post('/api/users/create-admin', newAdmin);
      
      toast({
        title: "Success",
        description: "Admin user created successfully",
      });
      
      // Reset form and refresh list
      setNewAdmin({ name: '', email: '', password: '' });
      setShowCreateForm(false);
      fetchAdminUsers(pagination.page);
    } catch (error: any) {
      console.error('Error creating admin:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create admin user",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  // Revoke admin privileges
  const revokeAdminPrivileges = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to revoke admin privileges for ${userName}?`)) {
      return;
    }

    try {
      await api.patch(`/api/users/${userId}/revoke-admin`);
      
      toast({
        title: "Success",
        description: `Admin privileges revoked for ${userName}`,
      });
      
      fetchAdminUsers(pagination.page);
    } catch (error: any) {
      console.error('Error revoking admin privileges:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to revoke admin privileges",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Management</h1>
          <p className="text-gray-600">Manage administrator accounts and permissions</p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Create Admin
        </Button>
      </div>

      {/* Create Admin Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Admin</CardTitle>
            <CardDescription>
              Add a new administrator to the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={createAdmin} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={newAdmin.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewAdmin({...newAdmin, name: e.target.value})}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newAdmin.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewAdmin({...newAdmin, email: e.target.value})}
                    placeholder="Enter email address"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPasswords ? "text" : "password"}
                    value={newAdmin.password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewAdmin({...newAdmin, password: e.target.value})}
                    placeholder="Enter secure password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPasswords(!showPasswords)}
                  >
                    {showPasswords ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Password should be at least 8 characters long
                </p>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Admin'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Admin Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Administrator Accounts ({pagination.totalAdminUsers})
          </CardTitle>
          <CardDescription>
            Current users with administrative privileges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {adminUsers.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No admin users found</p>
            ) : (
              adminUsers.map((admin) => (
                <div
                  key={admin.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Shield className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{admin.name}</h3>
                      <p className="text-sm text-gray-600">{admin.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">Admin</Badge>
                        {admin.emailVerified ? (
                          <Badge variant="default">Verified</Badge>
                        ) : (
                          <Badge variant="outline">Unverified</Badge>
                        )}
                        {admin.banned && (
                          <Badge variant="destructive">Banned</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500">
                      Joined {new Date(admin.createdAt).toLocaleDateString()}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => revokeAdminPrivileges(admin.id, admin.name)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <ShieldOff className="h-4 w-4" />
                      Revoke Admin
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchAdminUsers(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-3 text-sm">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchAdminUsers(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}