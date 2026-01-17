import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Switch } from '../components/ui/switch';
import {
  Users,
  UserPlus,
  Search,
  Download,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  UserCheck,
  UserX,
  Calendar,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  Filter,
  X
} from 'lucide-react';
import adminApiService from '../services/adminApiService';
import { useToast } from '../contexts/ToastContext';

const UserManagement = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showDeleted, setShowDeleted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [countryFilter, setCountryFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('');
  const [phoneFilter, setPhoneFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [coachIdFilter, setCoachIdFilter] = useState('');
  const [sponsorIdFilter, setSponsorIdFilter] = useState('');
  const [isVerifiedFilter, setIsVerifiedFilter] = useState('all');
  const [showFilterDialog, setShowFilterDialog] = useState(false);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 700);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Dialog states
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  
  // Form states
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'customer',
    status: 'active',
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: ''
  });

  const [createUserForm, setCreateUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'coach',
    status: 'active',
    coachId: '',
    notes: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    dateOfBirth: '',
    gender: '',
    occupation: '',
    company: '',
    website: '',
    bio: '',
    subscriptionPlan: '',
    paymentMethod: 'stripe',
    startDate: new Date().toISOString().split('T')[0],
    autoRenew: true
  });

  const [exportOptions, setExportOptions] = useState({
    format: 'csv',
    includeDeleted: false
  });

  const [togglingUsers, setTogglingUsers] = useState(new Set()); // Track users being toggled

  const [subscriptionPlans, setSubscriptionPlans] = useState([]);

  // Load users data
  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        includeDeleted: showDeleted,
        sortBy,
        sortOrder
      };
      
      // Only add search if it's not empty and debounced
      if (debouncedSearchTerm && debouncedSearchTerm.trim()) {
        params.search = debouncedSearchTerm.trim();
        // When searching, show all results (disable pagination for search)
        params.limit = 1000; // Large limit to show all matching results
      }
      
      // Only add status if it's not 'all'
      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      // Only add role if it's not 'all'
      if (roleFilter && roleFilter !== 'all') {
        params.role = roleFilter;
      }
      
      // Add date range filters
      if (startDate) {
        params.startDate = startDate;
      }

      if (endDate) {
        params.endDate = endDate;
      }

      // Add location filters
      if (countryFilter && countryFilter !== 'all') {
        params.country = countryFilter;
      }

      if (cityFilter && cityFilter.trim()) {
        params.city = cityFilter.trim();
      }

      // Add contact filters
      if (phoneFilter && phoneFilter.trim()) {
        params.phone = phoneFilter.trim();
      }

      if (emailFilter && emailFilter.trim()) {
        params.email = emailFilter.trim();
      }

      // Add coach/sponsor filters
      if (coachIdFilter && coachIdFilter.trim()) {
        params.selfCoachId = coachIdFilter.trim();
      }

      if (sponsorIdFilter && sponsorIdFilter.trim()) {
        params.sponsorId = sponsorIdFilter.trim();
      }

      // Add verification filter
      if (isVerifiedFilter && isVerifiedFilter !== 'all') {
        params.isVerified = isVerifiedFilter === 'verified';
      }
      
      const response = await adminApiService.getUsers(params);
      if (response.success) {
        setUsers(response.data.users);
        setTotalPages(response.data.totalPages);
      } else {
        showToast('Failed to load users', 'error');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      showToast('Error loading users', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load subscription plans
  const loadSubscriptionPlans = async () => {
    try {
      const response = await adminApiService.getSubscriptionPlans();
      if (response.success) {
        setSubscriptionPlans(response.data.plans || []);
      }
    } catch (error) {
      console.error('Error loading subscription plans:', error);
      setSubscriptionPlans([]); // Set empty array on error
    }
  };

  useEffect(() => {
    loadUsers();
    loadSubscriptionPlans();
  }, [currentPage, debouncedSearchTerm, statusFilter, roleFilter, startDate, endDate, countryFilter, cityFilter, phoneFilter, emailFilter, coachIdFilter, sponsorIdFilter, isVerifiedFilter, sortBy, sortOrder]);

  // Handle user selection
  const handleUserSelect = (userId, checked) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  // Handle select all
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedUsers(users.map(user => user._id));
    } else {
      setSelectedUsers([]);
    }
  };

  // Open user dialog
  const openUserDialog = (user = null) => {
    if (user) {
      setSelectedUser(user);
      setEditMode(true);
      setUserForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'client',
        status: user.status || 'active',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        country: user.country || '',
        zipCode: user.zipCode || ''
      });
    } else {
      setSelectedUser(null);
      setEditMode(false);
      setUserForm({
        name: '',
        email: '',
        phone: '',
        role: 'client',
        status: 'active',
        address: '',
        city: '',
        state: '',
        country: '',
        zipCode: ''
      });
    }
    setUserDialogOpen(true);
  };

  // Save user
  const saveUser = async () => {
    try {
      let response;
      if (editMode) {
        response = await adminApiService.updateUser(selectedUser._id, userForm);
      } else {
        // For new users, we'll use a different endpoint if available
        response = await adminApiService.createUser(userForm);
      }
      
      if (response.success) {
        showToast(editMode ? 'User updated successfully' : 'User created successfully', 'success');
        setUserDialogOpen(false);
        loadUsers();
      } else {
        showToast(response.message || 'Failed to save user', 'error');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      showToast('Error saving user', 'error');
    }
  };

  // Delete user
  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const response = await adminApiService.deleteUser(userId);
      if (response.success) {
        showToast('User deleted successfully', 'success');
        loadUsers();
      } else {
        showToast(response.message || 'Failed to delete user', 'error');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showToast('Error deleting user', 'error');
    }
  };

  // Restore user
  const restoreUser = async (userId) => {
    if (!confirm('Are you sure you want to restore this user?')) return;
    
    try {
      const response = await adminApiService.restoreUser(userId);
      if (response.success) {
        showToast('User restored successfully', 'success');
        loadUsers();
      } else {
        showToast(response.message || 'Failed to restore user', 'error');
      }
    } catch (error) {
      console.error('Error restoring user:', error);
      showToast('Error restoring user', 'error');
    }
  };

  // Update user status
  const updateUserStatus = async (userId, status) => {
    try {
      const response = await adminApiService.updateUserStatus(userId, status);
      if (response.success) {
        showToast('User status updated successfully', 'success');
        loadUsers();
      } else {
        showToast(response.message || 'Failed to update user status', 'error');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      showToast('Error updating user status', 'error');
    }
  };

  // Toggle user status with loading state
  const toggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    // Add user to toggling set
    setTogglingUsers(prev => new Set(prev).add(userId));

    try {
      await updateUserStatus(userId, newStatus);
    } finally {
      // Remove user from toggling set
      setTogglingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  // Approve user under review
  const approveUser = async (userId) => {
    // Add user to toggling set
    setTogglingUsers(prev => new Set(prev).add(userId));

    try {
      await updateUserStatus(userId, 'active');
    } finally {
      // Remove user from toggling set
      setTogglingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  // Reject user under review
  const rejectUser = async (userId) => {
    // Add user to toggling set
    setTogglingUsers(prev => new Set(prev).add(userId));

    try {
      await updateUserStatus(userId, 'inactive');
    } finally {
      // Remove user from toggling set
      setTogglingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  // Handle bulk actions
  const handleBulkAction = async () => {
    if (selectedUsers.length === 0) {
      showToast('Please select users first', 'warning');
      return;
    }

    try {
      switch (bulkAction) {
        case 'activate':
          await handleBulkUpdate({ status: 'active' });
          break;
        case 'deactivate':
          await handleBulkUpdate({ status: 'inactive' });
          break;
        case 'delete':
          await handleBulkDelete(false);
          break;
        case 'permanent_delete':
          await handleBulkDelete(true);
          break;
        default:
          showToast('Invalid bulk action', 'error');
          return;
      }
      setBulkActionDialogOpen(false);
    } catch (error) {
      console.error('Error performing bulk action:', error);
      showToast('Error performing bulk action', 'error');
    }
  };

  // Export users
  const exportUsers = async (format = 'csv') => {
    try {
      const response = await adminApiService.exportUsers(format, exportOptions.includeDeleted);
      if (response.success) {
        // Create download link
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users_export_${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        showToast('Users exported successfully', 'success');
      } else {
        showToast(response.message || 'Failed to export users', 'error');
      }
    } catch (error) {
      console.error('Error exporting users:', error);
      showToast('Error exporting users', 'error');
    }
  };

  // Create new user
  const handleCreateUser = async () => {
    try {
      if (!createUserForm.name || !createUserForm.email || !createUserForm.password) {
        showToast('Name, email, and password are required', 'error');
        return;
      }

      const response = await adminApiService.createUser(createUserForm);
      if (response.success) {
        showToast('User created successfully', 'success');
        setCreateUserDialogOpen(false);
        setCreateUserForm({
          name: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          role: 'coach',
          status: 'active',
          coachId: '',
          notes: '',
          address: '',
          city: '',
          state: '',
          country: '',
          zipCode: '',
          dateOfBirth: '',
          gender: '',
          occupation: '',
          company: '',
          website: '',
          bio: '',
          subscriptionPlan: '',
          paymentMethod: 'stripe',
          startDate: new Date().toISOString().split('T')[0],
          autoRenew: true
        });
        loadUsers();
      } else {
        showToast(response.message || 'Failed to create user', 'error');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      showToast('Error creating user', 'error');
    }
  };

  // Handle bulk operations with new API
  const handleBulkUpdate = async (updateData) => {
    try {
      const updates = selectedUsers.map(userId => ({
        userId,
        ...updateData
      }));

      const response = await adminApiService.bulkUpdateUsers(updates);
      if (response.success) {
        showToast(`Bulk update completed. ${response.data.updated.length} users updated successfully.`, 'success');
        if (response.data.errors.length > 0) {
          showToast(`${response.data.errors.length} users failed to update`, 'warning');
        }
        setSelectedUsers([]);
        loadUsers();
      } else {
        showToast(response.message || 'Failed to perform bulk update', 'error');
      }
    } catch (error) {
      console.error('Error performing bulk update:', error);
      showToast('Error performing bulk update', 'error');
    }
  };

  // Handle bulk delete with new API
  const handleBulkDelete = async (permanent = false) => {
    try {
      if (!confirm(`Are you sure you want to ${permanent ? 'permanently delete' : 'delete'} ${selectedUsers.length} users?`)) {
        return;
      }

      const response = await adminApiService.bulkDeleteUsers(selectedUsers, permanent);
      if (response.success) {
        showToast(`Bulk delete completed. ${response.data.deleted.length} users ${permanent ? 'permanently deleted' : 'deleted'} successfully.`, 'success');
        if (response.data.errors.length > 0) {
          showToast(`${response.data.errors.length} users failed to delete`, 'warning');
        }
        setSelectedUsers([]);
        loadUsers();
      } else {
        showToast(response.message || 'Failed to perform bulk delete', 'error');
      }
    } catch (error) {
      console.error('Error performing bulk delete:', error);
      showToast('Error performing bulk delete', 'error');
    }
  };

  // Get status badge variant
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'inactive':
        return <Badge className="bg-red-50 text-red-700 border-red-200"><UserX className="w-3 h-3 mr-1" />Deactivated</Badge>;
      case 'under_review':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200"><Clock className="w-3 h-3 mr-1" />Under Review</Badge>;
      case 'pending':
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'suspended':
        return <Badge className="bg-red-50 text-red-700 border-red-200"><AlertCircle className="w-3 h-3 mr-1" />Suspended</Badge>;
      default:
        return <Badge variant="outline" className="border-gray-300 text-gray-600">{status}</Badge>;
    }
  };

  // Get role badge variant
  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-50 text-purple-700 border-purple-200">Admin</Badge>;
      case 'coach':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200">Coach</Badge>;
      case 'customer':
        return <Badge className="bg-gray-50 text-gray-700 border-gray-200">Customer</Badge>;
      case 'staff':
        return <Badge className="bg-orange-50 text-orange-700 border-orange-200">Staff</Badge>;
      default:
        return <Badge variant="outline" className="border-gray-300 text-gray-600">{role}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">User Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage users, roles, and permissions</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setShowDeleted(!showDeleted)}
            variant={showDeleted ? "default" : "outline"}
            size="sm"
            className="h-9"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {showDeleted ? 'Hide Deleted' : 'Show Deleted'}
          </Button>
          <Button onClick={() => setExportDialogOpen(true)} variant="outline" size="sm" className="h-9">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setCreateUserDialogOpen(true)} size="sm" className="h-9">
            <UserPlus className="w-4 h-4 mr-2" />
            Create User
          </Button>
        </div>
      </div>

      {/* Users Table with Integrated Filters */}
      <Card className="border-gray-200">
        <CardContent className="p-0">
          {/* Filter Bar */}
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-9 bg-white border-gray-300"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilterDialog(true)}
                  className="h-9 px-3 text-gray-600 hover:text-gray-900"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  {(statusFilter !== 'all' || roleFilter !== 'all' || startDate || endDate || countryFilter !== 'all' || sponsorIdFilter || isVerifiedFilter !== 'all') && (
                    <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {selectedUsers.length > 0 && (
            <div className="border-b border-gray-200 bg-blue-50 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-700 font-medium">
                    {selectedUsers.length} user{selectedUsers.length === 1 ? '' : 's'} selected
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBulkActionDialogOpen(true)}
                    className="h-8 text-gray-700 border-gray-300"
                  >
                    <MoreHorizontal className="w-4 h-4 mr-2" />
                    Actions
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedUsers([])}
                    className="h-8 text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Users Table */}
          <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                  Loading users...
                </div>
              ) : (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200 hover:bg-gray-50">
                        <TableHead className="w-12 py-3">
                          <input
                            type="checkbox"
                            checked={selectedUsers.length === users.length && users.length > 0}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="rounded border-gray-300"
                          />
                        </TableHead>
                        <TableHead className="py-3 text-gray-700 font-medium">User</TableHead>
                        <TableHead className="py-3 text-gray-700 font-medium">Role & Status</TableHead>
                        <TableHead className="py-3 text-gray-700 font-medium">Contact</TableHead>
                        <TableHead className="py-3 text-gray-700 font-medium">Location</TableHead>
                        <TableHead className="py-3 text-gray-700 font-medium">Joined</TableHead>
                        <TableHead className="py-3 text-gray-700 font-medium w-12">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user._id} className={`border-gray-200 hover:bg-gray-50 ${user.deletedAt ? 'bg-red-50/50' : ''}`}>
                          <TableCell className="py-4">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user._id)}
                              onChange={(e) => handleUserSelect(user._id, e.target.checked)}
                              className="rounded border-gray-300"
                            />
                          </TableCell>
                          <TableCell className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-[35px] h-[35px] rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                          {user.profilePictureUrl || user.profilePicture ? (
                            <img
                              src={user.profilePictureUrl || user.profilePicture}
                              alt={user.name || 'User'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className="w-full h-full flex items-center justify-center" style={{ display: user.profilePictureUrl || user.profilePicture ? 'none' : 'flex' }}>
                            <Users className="w-[18px] h-[18px] text-gray-600" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-900">
                            <button
                              onClick={() => {
                                console.log('🔍 [UserManagement] Navigating to user:', user._id);
                                navigate(`/users/${user._id}`);
                              }}
                              className="text-blue-600 hover:text-blue-800 cursor-pointer"
                            >
                              {user.name || 'N/A'}
                            </button>
                            {user.deletedAt && (
                              <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                                DELETED
                              </span>
                            )}
                          </div>
                          {user.sponsorId && user.sponsorId.selfCoachId && (
                            <div className="text-xs text-gray-400 mt-1">
                              <span className="font-medium">Sponsor:</span> {user.sponsorId.selfCoachId} - {user.sponsorId.name || 'Unknown Coach'}
                            </div>
                          )}
                          {user.selfCoachId && (
                            <div className="text-xs text-gray-400 mt-1">
                              <span className="font-medium">Coach ID:</span> {user.selfCoachId}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col space-y-3">
                        <div className="flex justify-center">
                          {getRoleBadge(user.role)}
                        </div>
                          <div className="flex justify-center">
                            {togglingUsers.has(user._id) ? (
                              <div className="w-6 h-3 bg-gray-200 rounded-full flex items-center justify-center">
                                <RefreshCw className="w-2 h-2 text-gray-500 animate-spin" />
                              </div>
                            ) : user.status === 'under_review' ? (
                              <div className="text-xs text-blue-600 font-medium px-2 py-1 bg-blue-50 rounded">
                                Pending
                              </div>
                            ) : (
                              <Switch
                                checked={user.status === 'active'}
                                onCheckedChange={() => toggleUserStatus(user._id, user.status)}
                                className={`scale-75 ${
                                  user.status === 'active'
                                    ? 'data-[state=checked]:bg-green-500'
                                    : 'data-[state=unchecked]:bg-red-500'
                                }`}
                              />
                            )}
                          </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-3 h-3 mr-2" />
                          {user.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-3 h-3 mr-2" />
                          {user.phone || '—'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      {user.country ? (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-3 h-3 mr-2" />
                          <span className="capitalize">{user.country}</span>
                          {user.city && <span className="text-gray-400">, {user.city}</span>}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-3 h-3 mr-2" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openUserDialog(user)}
                          className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        {user.status === 'under_review' ? (
                          <>
                            {togglingUsers.has(user._id) ? (
                              <div className="flex items-center space-x-1">
                                <RefreshCw className="w-4 h-4 text-gray-500 animate-spin" />
                              </div>
                            ) : (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => approveUser(user._id)}
                                  className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                                  title="Approve user"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => rejectUser(user._id)}
                                  className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  title="Reject user"
                                >
                                  <UserX className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </>
                        ) : (
                          !user.deletedAt && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openUserDialog(user)}
                                className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteUser(user._id)}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )
                        )}

                        {user.deletedAt && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => restoreUser(user._id)}
                            className="h-8 w-8 p-0 text-green-500 hover:text-green-700"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="h-8 border-gray-300 text-gray-700"
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="h-8 border-gray-300 text-gray-700"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
              )}
                </div>
              )}
          </div>
        </CardContent>
      </Card>
      {/* Dialogs */}
      <>
        <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editMode ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogDescription>
              {editMode ? 'Update user information' : 'Create a new user account'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={userForm.name}
                  onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={userForm.phone}
                  onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={userForm.role} onValueChange={(value) => setUserForm({...userForm, role: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="coach">Coach</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={userForm.status} onValueChange={(value) => setUserForm({...userForm, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={userForm.city}
                  onChange={(e) => setUserForm({...userForm, city: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={userForm.state}
                  onChange={(e) => setUserForm({...userForm, state: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={userForm.country}
                  onChange={(e) => setUserForm({...userForm, country: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={userForm.address}
                onChange={(e) => setUserForm({...userForm, address: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveUser}>
              {editMode ? 'Update User' : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Action Dialog */}
      <Dialog open={bulkActionDialogOpen} onOpenChange={setBulkActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Actions</DialogTitle>
            <DialogDescription>
              Perform actions on {selectedUsers.length} selected users
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="bulk-action">Action</Label>
              <Select value={bulkAction} onValueChange={setBulkAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activate">Activate Users</SelectItem>
                  <SelectItem value="deactivate">Deactivate Users</SelectItem>
                  <SelectItem value="delete">Delete Users (Soft Delete)</SelectItem>
                  <SelectItem value="permanent_delete">Permanently Delete Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkAction} disabled={!bulkAction}>
              Execute Action
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={createUserDialogOpen} onOpenChange={setCreateUserDialogOpen}>
        <DialogContent className="w-[50vw] h-[calc(600px+10vh)] overflow-y-auto flex flex-col">
          <DialogHeader className="text-center pb-4 flex-shrink-0">
            <DialogTitle className="text-xl font-semibold text-gray-900">Create New User</DialogTitle>
            <DialogDescription className="text-gray-600">
              Add a new user to the system with complete details
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="basic" className="text-sm">Basic Info</TabsTrigger>
              <TabsTrigger value="account" className="text-sm">Account</TabsTrigger>
              <TabsTrigger value="subscription" className="text-sm">Subscription</TabsTrigger>
              <TabsTrigger value="details" className="text-sm">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-5 mt-0 flex-1">
              <div className="space-y-2">
                <Label htmlFor="create-name" className="text-sm font-medium text-gray-700">
                  Full Name *
                </Label>
                <Input
                  id="create-name"
                  value={createUserForm.name}
                  onChange={(e) => setCreateUserForm({...createUserForm, name: e.target.value})}
                  placeholder="Enter full name"
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-email" className="text-sm font-medium text-gray-700">
                  Email Address *
                </Label>
                <Input
                  id="create-email"
                  type="email"
                  value={createUserForm.email}
                  onChange={(e) => setCreateUserForm({...createUserForm, email: e.target.value})}
                  placeholder="Enter email address"
                  className="h-10"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-password" className="text-sm font-medium text-gray-700">
                    Password *
                  </Label>
                  <Input
                    id="create-password"
                    type="password"
                    value={createUserForm.password}
                    onChange={(e) => setCreateUserForm({...createUserForm, password: e.target.value})}
                    placeholder="Enter password"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-phone" className="text-sm font-medium text-gray-700">
                    Phone Number
                  </Label>
                  <Input
                    id="create-phone"
                    value={createUserForm.phone}
                    onChange={(e) => setCreateUserForm({...createUserForm, phone: e.target.value})}
                    placeholder="Enter phone number"
                    className="h-10"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="account" className="space-y-5 mt-0 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-role" className="text-sm font-medium text-gray-700">
                    Role *
                  </Label>
                  <Select value={createUserForm.role} onValueChange={(value) => setCreateUserForm({...createUserForm, role: value})}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coach">Coach</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-status" className="text-sm font-medium text-gray-700">
                    Status
                  </Label>
                  <Select value={createUserForm.status} onValueChange={(value) => setCreateUserForm({...createUserForm, status: value})}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-coach" className="text-sm font-medium text-gray-700">
                  Sponsor Coach ID
                </Label>
                <Input
                  id="create-coach"
                  value={createUserForm.coachId}
                  onChange={(e) => setCreateUserForm({...createUserForm, coachId: e.target.value})}
                  placeholder="Enter sponsor coach ID (optional)"
                  className="h-10"
                />
              </div>
            </TabsContent>

            <TabsContent value="subscription" className="space-y-5 mt-0 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-subscription-plan" className="text-sm font-medium text-gray-700">
                    Subscription Plan
                  </Label>
                  <Select value={createUserForm.subscriptionPlan} onValueChange={(value) => setCreateUserForm({...createUserForm, subscriptionPlan: value})}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Plan</SelectItem>
                      {Array.isArray(subscriptionPlans) && subscriptionPlans.map((plan) => (
                        <SelectItem key={plan._id || plan.id} value={plan._id || plan.id}>
                          {plan.name} - ${plan.price}/{plan.billingCycle || plan.interval}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-payment-method" className="text-sm font-medium text-gray-700">
                    Payment Method
                  </Label>
                  <Select value={createUserForm.paymentMethod} onValueChange={(value) => setCreateUserForm({...createUserForm, paymentMethod: value})}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="razorpay">Razorpay</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-start-date" className="text-sm font-medium text-gray-700">
                    Start Date
                  </Label>
                  <Input
                    id="create-start-date"
                    type="date"
                    value={createUserForm.startDate}
                    onChange={(e) => setCreateUserForm({...createUserForm, startDate: e.target.value})}
                    className="h-10"
                  />
                </div>

                <div className="flex items-center space-x-3 pt-8">
                  <input
                    type="checkbox"
                    id="create-auto-renew"
                    checked={createUserForm.autoRenew}
                    onChange={(e) => setCreateUserForm({...createUserForm, autoRenew: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="create-auto-renew" className="text-sm font-medium text-gray-700">
                    Auto Renew
                  </Label>
                </div>
              </div>

              {createUserForm.subscriptionPlan && createUserForm.subscriptionPlan !== "none" && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Selected Plan Details</h4>
                  {Array.isArray(subscriptionPlans) && createUserForm.subscriptionPlan !== "none" && subscriptionPlans.find(p => (p._id || p.id) === createUserForm.subscriptionPlan) && (
                    <div className="text-sm text-gray-600 space-y-1">
                      {(() => {
                        const selectedPlan = subscriptionPlans.find(p => (p._id || p.id) === createUserForm.subscriptionPlan);
                        return (
                          <>
                            <p><span className="font-medium">Plan:</span> {selectedPlan.name}</p>
                            <p><span className="font-medium">Price:</span> ${selectedPlan.price}/{selectedPlan.billingCycle || selectedPlan.interval}</p>
                            <p><span className="font-medium">Features:</span> {Array.isArray(selectedPlan.features) ? selectedPlan.features.join(', ') : 'N/A'}</p>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="details" className="space-y-5 mt-0 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-dob" className="text-sm font-medium text-gray-700">
                    Date of Birth
                  </Label>
                  <Input
                    id="create-dob"
                    type="date"
                    value={createUserForm.dateOfBirth}
                    onChange={(e) => setCreateUserForm({...createUserForm, dateOfBirth: e.target.value})}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-gender" className="text-sm font-medium text-gray-700">
                    Gender
                  </Label>
                  <Select value={createUserForm.gender} onValueChange={(value) => setCreateUserForm({...createUserForm, gender: value})}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-occupation" className="text-sm font-medium text-gray-700">
                    Occupation
                  </Label>
                  <Input
                    id="create-occupation"
                    value={createUserForm.occupation}
                    onChange={(e) => setCreateUserForm({...createUserForm, occupation: e.target.value})}
                    placeholder="Enter occupation"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-company" className="text-sm font-medium text-gray-700">
                    Company
                  </Label>
                  <Input
                    id="create-company"
                    value={createUserForm.company}
                    onChange={(e) => setCreateUserForm({...createUserForm, company: e.target.value})}
                    placeholder="Enter company name"
                    className="h-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-website" className="text-sm font-medium text-gray-700">
                  Website
                </Label>
                <Input
                  id="create-website"
                  type="url"
                  value={createUserForm.website}
                  onChange={(e) => setCreateUserForm({...createUserForm, website: e.target.value})}
                  placeholder="https://example.com"
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-address" className="text-sm font-medium text-gray-700">
                  Address
                </Label>
                <Input
                  id="create-address"
                  value={createUserForm.address}
                  onChange={(e) => setCreateUserForm({...createUserForm, address: e.target.value})}
                  placeholder="Enter street address"
                  className="h-10"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-city" className="text-sm font-medium text-gray-700">
                    City
                  </Label>
                  <Input
                    id="create-city"
                    value={createUserForm.city}
                    onChange={(e) => setCreateUserForm({...createUserForm, city: e.target.value})}
                    placeholder="Enter city"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-country" className="text-sm font-medium text-gray-700">
                    Country
                  </Label>
                  <Input
                    id="create-country"
                    value={createUserForm.country}
                    onChange={(e) => setCreateUserForm({...createUserForm, country: e.target.value})}
                    placeholder="Enter country"
                    className="h-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-bio" className="text-sm font-medium text-gray-700">
                  Bio
                </Label>
                <textarea
                  id="create-bio"
                  className="w-full p-3 border border-gray-300 rounded-md min-h-[80px] resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={createUserForm.bio}
                  onChange={(e) => setCreateUserForm({...createUserForm, bio: e.target.value})}
                  placeholder="Enter user bio"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-notes" className="text-sm font-medium text-gray-700">
                  Admin Notes
                </Label>
                <textarea
                  id="create-notes"
                  className="w-full p-3 border border-gray-300 rounded-md min-h-[80px] resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={createUserForm.notes}
                  onChange={(e) => setCreateUserForm({...createUserForm, notes: e.target.value})}
                  placeholder="Enter admin notes about this user"
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex gap-3 pt-6 border-t border-gray-200 flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => setCreateUserDialogOpen(false)}
              className="flex-1 h-10 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateUser}
              className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Export Users</DialogTitle>
            <DialogDescription>
              Choose export format and options
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="export-format">Format</Label>
              <Select value={exportOptions.format} onValueChange={(value) => setExportOptions({...exportOptions, format: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="include-deleted"
                checked={exportOptions.includeDeleted}
                onChange={(e) => setExportOptions({...exportOptions, includeDeleted: e.target.checked})}
                className="rounded"
              />
              <Label htmlFor="include-deleted">Include deleted users</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              exportUsers(exportOptions.format);
              setExportDialogOpen(false);
            }}>
              Export Users
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Advanced Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Filter className="w-5 h-5 text-gray-600" />
              Advanced Filters
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Refine your search with precise filters
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* Primary Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Role Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Role</Label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="coach">Coach</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Verification Status */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Verification</Label>
                <Select value={isVerifiedFilter} onValueChange={setIsVerifiedFilter}>
                  <SelectTrigger className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="All Users" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="verified">Verified Only</SelectItem>
                    <SelectItem value="unverified">Unverified Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">Join Date Range</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">From</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">To</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Secondary Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Location Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Country</Label>
                <Select value={countryFilter} onValueChange={setCountryFilter}>
                  <SelectTrigger className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="All Countries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    <SelectItem value="India">India</SelectItem>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="Australia">Australia</SelectItem>
                    <SelectItem value="Germany">Germany</SelectItem>
                    <SelectItem value="France">France</SelectItem>
                    <SelectItem value="Japan">Japan</SelectItem>
                    <SelectItem value="Brazil">Brazil</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sponsor ID Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Sponsor ID</Label>
                <Input
                  placeholder="Enter sponsor coach ID"
                  value={sponsorIdFilter}
                  onChange={(e) => setSponsorIdFilter(e.target.value)}
                  className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-3 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => {
                // Clear all filters
                setStatusFilter('all');
                setRoleFilter('all');
                setStartDate('');
                setEndDate('');
                setCountryFilter('all');
                setCityFilter('');
                setPhoneFilter('');
                setEmailFilter('');
                setCoachIdFilter('');
                setSponsorIdFilter('');
                setIsVerifiedFilter('all');
                setShowFilterDialog(false);
              }}
              className="flex items-center gap-2 h-10 px-4 border-gray-300 hover:bg-gray-50"
            >
              <X className="w-4 h-4" />
              Clear All
            </Button>
            <Button
              onClick={() => setShowFilterDialog(false)}
              className="h-10 px-6 bg-blue-600 hover:bg-blue-700"
            >
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      </>
    </div>
  );
};

export default UserManagement;