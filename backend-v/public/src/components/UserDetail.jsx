import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Globe,
  Edit,
  Save,
  X,
  Trash2,
  UserCheck,
  UserX,
  CreditCard,
  Activity,
  TrendingUp,
  Clock,
  Shield,
  AlertCircle,
  CheckCircle,
  MoreHorizontal,
  Download,
  Send,
  MessageSquare,
  FileText,
  Settings
} from 'lucide-react';
import adminApiService from '../services/adminApiService';
import { useToast } from '../contexts/ToastContext';

const UserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  
  // Additional data state
  const [userData, setUserData] = useState({
    subscriptions: [],
    appointments: [],
    leads: [],
    campaigns: [],
    funnels: [],
    payments: [],
    hierarchyRequests: [],
    coachPlans: [],
    usageStats: {},
    statistics: {},
    summary: {}
  });
  
  // Coach-specific state
  const [showCoachActions, setShowCoachActions] = useState(false);
  const [showRevenueDialog, setShowRevenueDialog] = useState(false);
  const [showBalanceDialog, setShowBalanceDialog] = useState(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);

  // Load user details
  const loadUserDetails = async () => {
    try {
      setLoading(true);
      console.log('🔍 [UserDetail] Loading user details for ID:', userId);
      const response = await adminApiService.getUserById(userId);
      console.log('🔍 [UserDetail] Response:', response);
      if (response.success) {
        setUser(response.data.user);
        setEditForm(response.data.user);
        setUserData({
          subscriptions: response.data.subscriptions || [],
          appointments: response.data.appointments || [],
          leads: response.data.leads || [],
          campaigns: response.data.campaigns || [],
          funnels: response.data.funnels || [],
          payments: response.data.payments || [],
          hierarchyRequests: response.data.hierarchyRequests || [],
          coachPlans: response.data.coachPlans || [],
          usageStats: response.data.usageStats || {},
          statistics: response.data.statistics || {},
          summary: response.data.summary || {}
        });
        console.log('✅ [UserDetail] User loaded successfully:', response.data.user);
        console.log('📊 [UserDetail] Additional data loaded:', response.data);
      } else {
        console.log('❌ [UserDetail] User not found, response:', response);
        showToast('User not found', 'error');
        navigate('/users');
      }
    } catch (error) {
      console.error('❌ [UserDetail] Error loading user details:', error);
      showToast('Error loading user details', 'error');
      navigate('/users');
    } finally {
      setLoading(false);
    }
  };

  // Load subscription plans
  const loadSubscriptionPlans = async () => {
    try {
      const response = await adminApiService.getSubscriptionPlans();
      if (response.success) {
        setSubscriptionPlans(response.data);
      }
    } catch (error) {
      console.error('Error loading subscription plans:', error);
    }
  };

  useEffect(() => {
    loadUserDetails();
    loadSubscriptionPlans();
  }, [userId]);

  // Handle user update
  const handleUpdateUser = async () => {
    try {
      const response = await adminApiService.updateUser(userId, editForm);
      if (response.success) {
        setUser(response.data);
        setEditMode(false);
        showToast('User updated successfully', 'success');
      } else {
        showToast(response.message || 'Failed to update user', 'error');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      showToast('Error updating user', 'error');
    }
  };

  // Coach-specific functions
  const handleActivateUser = async () => {
    try {
      const response = await adminApiService.updateUserStatus(userId, 'active');
      if (response.success) {
        setUser(prev => ({ ...prev, status: 'active' }));
        showToast('User activated successfully', 'success');
      } else {
        showToast(response.message || 'Failed to activate user', 'error');
      }
    } catch (error) {
      console.error('Error activating user:', error);
      showToast('Error activating user', 'error');
    }
  };

  const handleDeactivateUser = async () => {
    try {
      const response = await adminApiService.updateUserStatus(userId, 'inactive');
      if (response.success) {
        setUser(prev => ({ ...prev, status: 'inactive' }));
        showToast('User deactivated successfully', 'success');
      } else {
        showToast(response.message || 'Failed to deactivate user', 'error');
      }
    } catch (error) {
      console.error('Error deactivating user:', error);
      showToast('Error deactivating user', 'error');
    }
  };

  const handleSuspendUser = async () => {
    try {
      const response = await adminApiService.updateUserStatus(userId, 'suspended');
      if (response.success) {
        setUser(prev => ({ ...prev, status: 'suspended' }));
        showToast('User suspended successfully', 'success');
      } else {
        showToast(response.message || 'Failed to suspend user', 'error');
      }
    } catch (error) {
      console.error('Error suspending user:', error);
      showToast('Error suspending user', 'error');
    }
  };

  const handleChangeSubscription = async (planId) => {
    try {
      const response = await adminApiService.updateUser(userId, { 
        subscriptionPlan: planId,
        subscriptionStatus: 'active'
      });
      if (response.success) {
        setUser(prev => ({ ...prev, subscriptionPlan: planId }));
        showToast('Subscription updated successfully', 'success');
        setShowSubscriptionDialog(false);
      } else {
        showToast(response.message || 'Failed to update subscription', 'error');
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      showToast('Error updating subscription', 'error');
    }
  };

  // Handle status change
  const handleStatusChange = async () => {
    try {
      const response = await adminApiService.updateUser(userId, { status: newStatus });
      if (response.success) {
        setUser(response.data);
        setShowStatusDialog(false);
        showToast(`User status changed to ${newStatus}`, 'success');
      } else {
        showToast(response.message || 'Failed to update status', 'error');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showToast('Error updating status', 'error');
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (permanent = false) => {
    try {
      const response = await adminApiService.deleteUser(userId);
      if (response.success) {
        showToast(`User ${permanent ? 'permanently deleted' : 'deleted'} successfully`, 'success');
        navigate('/users');
      } else {
        showToast(response.message || 'Failed to delete user', 'error');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showToast('Error deleting user', 'error');
    }
  };

  // Get status badge variant
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary"><UserX className="w-3 h-3 mr-1" />Inactive</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-yellow-300 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'suspended':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get role badge variant
  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <Badge variant="destructive"><Shield className="w-3 h-3 mr-1" />Admin</Badge>;
      case 'coach':
        return <Badge variant="default" className="bg-blue-100 text-blue-800"><UserCheck className="w-3 h-3 mr-1" />Coach</Badge>;
      case 'premium':
        return <Badge variant="default" className="bg-purple-100 text-purple-800"><TrendingUp className="w-3 h-3 mr-1" />Premium</Badge>;
      case 'user':
        return <Badge variant="outline"><User className="w-3 h-3 mr-1" />User</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">User not found</h2>
          <p className="text-gray-600 mt-2">The user you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/users')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to User Management
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/users')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
            <p className="text-muted-foreground">User ID: {user._id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {/* Coach-specific actions */}
          {user.role === 'coach' && (
            <>
              <Button 
                variant="outline" 
                onClick={() => setShowCoachActions(!showCoachActions)}
                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                <Shield className="w-4 h-4 mr-2" />
                Coach Actions
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowRevenueDialog(true)}
                className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Revenue
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowBalanceDialog(true)}
                className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Balance
              </Button>
            </>
          )}
          
          <Button 
            variant="outline" 
            onClick={() => setShowStatusDialog(true)}
          >
            <UserCheck className="w-4 h-4 mr-2" />
            Change Status
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowSubscriptionDialog(true)}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Subscription
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
          <Button onClick={() => setEditMode(!editMode)}>
            <Edit className="w-4 h-4 mr-2" />
            {editMode ? 'Cancel' : 'Edit'}
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getStatusBadge(user.status)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Role</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getRoleBadge(user.role)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userData.statistics?.totalSubscriptions || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active: {userData.statistics?.activeSubscriptions || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{userData.summary?.totalValue || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Revenue: ₹{userData.statistics?.totalPlanRevenue || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userData.statistics?.totalAppointments || 0}</div>
            <p className="text-xs text-muted-foreground">
              Completed: {userData.statistics?.completedAppointments || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userData.statistics?.totalLeads || 0}</div>
            <p className="text-xs text-muted-foreground">
              Converted: {userData.statistics?.convertedLeads || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Credits</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userData.usageStats?.aiCredits || 0}</div>
            <p className="text-xs text-muted-foreground">
              Email Credits: {userData.usageStats?.emailCredits || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userData.summary?.engagementScore || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Last Active: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Core user details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                {user.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">{user.phone}</p>
                    </div>
                  </div>
                )}
                {user.coachId && (
                  <div className="flex items-center space-x-3">
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Assigned Coach</p>
                      <p className="text-sm text-muted-foreground">{user.coachId}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Address and location details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.address && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">{user.address}</p>
                    </div>
                  </div>
                )}
                {(user.city || user.state || user.country) && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">
                        {[user.city, user.state, user.country].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                )}
                {user.zipCode && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">ZIP Code</p>
                      <p className="text-sm text-muted-foreground">{user.zipCode}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Admin Notes */}
          {user.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Admin Notes</CardTitle>
                <CardDescription>Internal notes about this user</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{user.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="personal" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Details */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Details</CardTitle>
                <CardDescription>Personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.dateOfBirth && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Date of Birth</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(user.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
                {user.gender && (
                  <div className="flex items-center space-x-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Gender</p>
                      <p className="text-sm text-muted-foreground capitalize">{user.gender}</p>
                    </div>
                  </div>
                )}
                {user.occupation && (
                  <div className="flex items-center space-x-3">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Occupation</p>
                      <p className="text-sm text-muted-foreground">{user.occupation}</p>
                    </div>
                  </div>
                )}
                {user.company && (
                  <div className="flex items-center space-x-3">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Company</p>
                      <p className="text-sm text-muted-foreground">{user.company}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Online Presence */}
            <Card>
              <CardHeader>
                <CardTitle>Online Presence</CardTitle>
                <CardDescription>Web presence and social links</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.website && (
                  <div className="flex items-center space-x-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Website</p>
                      <a 
                        href={user.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {user.website}
                      </a>
                    </div>
                  </div>
                )}
                {user.bio && (
                  <div>
                    <p className="text-sm font-medium mb-2">Bio</p>
                    <p className="text-sm text-muted-foreground">{user.bio}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Subscription */}
            <Card>
              <CardHeader>
                <CardTitle>Current Subscription</CardTitle>
                <CardDescription>Active subscription details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {userData.subscriptions?.length > 0 ? (
                  userData.subscriptions.slice(0, 1).map((subscription, index) => (
                    <div key={index} className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Plan</p>
                          <p className="text-sm text-muted-foreground">
                            {subscription.planId?.name || 'Unknown Plan'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Price</p>
                          <p className="text-sm text-muted-foreground">
                            ₹{subscription.planId?.price || 0}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Status</p>
                          <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                            {subscription.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Start Date</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(subscription.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No active subscription</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Recent payment transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {userData.payments?.length > 0 ? (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {userData.payments.slice(0, 5).map((payment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">₹{payment.amount}</p>
                            <p className="text-xs text-muted-foreground">
                              {payment.planId?.name || 'Payment'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={payment.status === 'success' ? 'default' : 'secondary'}>
                            {payment.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No payment history</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Subscription Statistics */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Subscription Statistics</CardTitle>
                <CardDescription>Overall subscription metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {userData.statistics?.totalSubscriptions || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Subscriptions</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {userData.statistics?.activeSubscriptions || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Active</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      ₹{userData.statistics?.totalSubscriptionValue || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Value</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      ₹{userData.statistics?.totalPlanRevenue || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>


        <TabsContent value="settings" className="space-y-4">
          {editMode ? (
            <Card>
              <CardHeader>
                <CardTitle>Edit User Information</CardTitle>
                <CardDescription>Update user details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-name">Name</Label>
                    <Input
                      id="edit-name"
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editForm.email || ''}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-phone">Phone</Label>
                    <Input
                      id="edit-phone"
                      value={editForm.phone || ''}
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-role">Role</Label>
                    <Select value={editForm.role || 'user'} onValueChange={(value) => setEditForm({...editForm, role: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="coach">Coach</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-notes">Admin Notes</Label>
                  <textarea
                    id="edit-notes"
                    className="w-full p-2 border rounded-md min-h-[80px]"
                    value={editForm.notes || ''}
                    onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setEditMode(false)}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateUser}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Account status and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Account Status</p>
                      <p className="text-sm text-muted-foreground">Current account status</p>
                    </div>
                    {getStatusBadge(user.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Role</p>
                      <p className="text-sm text-muted-foreground">User role and permissions</p>
                    </div>
                    {getRoleBadge(user.role)}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Email Verified</p>
                      <p className="text-sm text-muted-foreground">Email verification status</p>
                    </div>
                    <Badge variant={user.emailVerified ? 'default' : 'secondary'}>
                      {user.emailVerified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Phone Verified</p>
                      <p className="text-sm text-muted-foreground">Phone verification status</p>
                    </div>
                    <Badge variant={user.phoneVerified ? 'default' : 'secondary'}>
                      {user.phoneVerified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Usage & Credits */}
              <Card>
                <CardHeader>
                  <CardTitle>Usage & Credits</CardTitle>
                  <CardDescription>Current usage and available credits</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">AI Credits</p>
                      <p className="text-sm text-muted-foreground">Available AI credits</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-purple-600">
                        {userData.usageStats?.aiCredits || 0}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Email Credits</p>
                      <p className="text-sm text-muted-foreground">Available email credits</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">
                        {userData.usageStats?.emailCredits || 0}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Login Count</p>
                      <p className="text-sm text-muted-foreground">Total login attempts</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {userData.usageStats?.loginCount || 0}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Last Active</p>
                      <p className="text-sm text-muted-foreground">Last activity timestamp</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {userData.usageStats?.lastActiveAt ? 
                          new Date(userData.usageStats.lastActiveAt).toLocaleDateString() : 
                          'Never'
                        }
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Information */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Account creation and management details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                      <p className="text-sm font-bold">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Last Login</p>
                      <p className="text-sm font-bold">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">User ID</p>
                      <p className="text-sm font-bold font-mono text-xs">
                        {user._id}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Engagement Score</p>
                      <p className="text-sm font-bold text-green-600">
                        {userData.summary?.engagementScore || 0}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Status Change Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Status</DialogTitle>
            <DialogDescription>
              Update the status for {user.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-status">New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusChange} disabled={!newStatus}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {user.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => handleDeleteUser(false)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Coach Actions Dialog */}
      <Dialog open={showCoachActions} onOpenChange={setShowCoachActions}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Coach Actions</DialogTitle>
            <DialogDescription>
              Manage coach-specific settings for {user.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button 
                onClick={handleActivateUser}
                className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                disabled={user.status === 'active'}
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Activate User
              </Button>
              <Button 
                onClick={handleDeactivateUser}
                className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                disabled={user.status === 'inactive'}
              >
                <UserX className="w-4 h-4 mr-2" />
                Deactivate User
              </Button>
              <Button 
                onClick={handleSuspendUser}
                className="bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
                disabled={user.status === 'suspended'}
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Suspend User
              </Button>
              <Button 
                onClick={() => setShowSubscriptionDialog(true)}
                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Change Subscription
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCoachActions(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revenue Dialog */}
      <Dialog open={showRevenueDialog} onOpenChange={setShowRevenueDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revenue Overview</DialogTitle>
            <DialogDescription>
              Revenue details for {user.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    ₹{userData.statistics?.totalPlanRevenue || 0}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Subscription Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    ₹{userData.statistics?.totalSubscriptionValue || 0}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Recent Payments</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {userData.payments?.slice(0, 5).map((payment, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">₹{payment.amount}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )) || <p className="text-sm text-gray-500">No payments found</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRevenueDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Balance Dialog */}
      <Dialog open={showBalanceDialog} onOpenChange={setShowBalanceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Account Balance</DialogTitle>
            <DialogDescription>
              Balance and credits for {user.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">AI Credits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {userData.usageStats?.aiCredits || 0}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Email Credits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {userData.usageStats?.emailCredits || 0}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Usage Statistics</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Login Count</span>
                  <span className="text-sm font-medium">{userData.usageStats?.loginCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Last Active</span>
                  <span className="text-sm font-medium">
                    {userData.usageStats?.lastActiveAt ? 
                      new Date(userData.usageStats.lastActiveAt).toLocaleDateString() : 
                      'Never'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBalanceDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subscription Change Dialog */}
      <Dialog open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Subscription</DialogTitle>
            <DialogDescription>
              Update subscription plan for {user.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="subscription-plan">Select Plan</Label>
              <Select onValueChange={handleChangeSubscription}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subscription plan" />
                </SelectTrigger>
                <SelectContent>
                  {subscriptionPlans.map((plan) => (
                    <SelectItem key={plan._id} value={plan._id}>
                      {plan.name} - ₹{plan.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubscriptionDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserDetail;
