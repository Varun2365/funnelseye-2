import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { useToast } from '../contexts/ToastContext';
import axios from 'axios';

// Note: axios defaults are configured in AuthContext

const SubscriptionManagement = () => {
    const [plans, setPlans] = useState([]);
    const [coachSubscriptions, setCoachSubscriptions] = useState([]);
    const [coaches, setCoaches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('plans');
    const { showToast } = useToast();

    // Get auth token from localStorage
    const getAuthToken = () => {
        const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
        console.log('🔐 [AUTH] Token found:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
        return token;
    };

    // Note: Authorization header is managed by AuthContext

    // Form states
    const [planForm, setPlanForm] = useState({
        name: '',
        description: '',
        price: { amount: '', currency: 'USD', billingCycle: 'monthly' },
        features: {
            maxFunnels: 5, maxLeads: 1000, maxStaff: 3, maxAutomationRules: 10,
            aiFeatures: false, advancedAnalytics: false, prioritySupport: false, customDomain: false
        },
        isPopular: false, sortOrder: 0
    });

    const [subscriptionForm, setSubscriptionForm] = useState({
        coachId: '', planId: '', billingCycle: 'monthly', autoRenew: true, notes: ''
    });

    // Advanced management states
    const [selectedSubscription, setSelectedSubscription] = useState(null);
    const [subscriptionDetails, setSubscriptionDetails] = useState(null);
    const [searchFilters, setSearchFilters] = useState({
        status: '',
        planId: '',
        coachId: '',
        startDate: '',
        endDate: '',
        page: 1,
        limit: 20
    });
    const [searchResults, setSearchResults] = useState([]);
    const [pagination, setPagination] = useState({});
    const [expiringSubscriptions, setExpiringSubscriptions] = useState([]);
    const [revenueData, setRevenueData] = useState({});
    const [bulkOperation, setBulkOperation] = useState({
        operation: 'extend',
        subscriptionIds: [],
        data: {}
    });

    useEffect(() => {
        // Debug: Show all storage contents
        console.log('🔐 [DEBUG] localStorage contents:', Object.keys(localStorage).reduce((acc, key) => {
            if (key.includes('token') || key.includes('auth') || key.includes('admin')) {
                acc[key] = localStorage.getItem(key);
            }
            return acc;
        }, {}));
        
        console.log('🔐 [DEBUG] sessionStorage contents:', Object.keys(sessionStorage).reduce((acc, key) => {
            if (key.includes('token') || key.includes('auth') || key.includes('admin')) {
                acc[key] = sessionStorage.getItem(key);
            }
            return acc;
        }, {}));
        
        fetchAllData();
    }, []);

    // Fetch additional data when tab changes
    useEffect(() => {
        if (activeTab === 'advanced') {
            fetchExpiringSubscriptions(7);
        } else if (activeTab === 'revenue') {
            fetchRevenueAnalytics('month');
        }
    }, [activeTab]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchPlans(),
                fetchCoachSubscriptions(),
                fetchCoaches()
            ]);
        } catch (error) {
            console.error('Error fetching subscription data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPlans = async () => {
        try {
            const token = getAuthToken();
            if (!token) {
                console.error('No auth token found');
                setPlans([]);
                return;
            }
            
            console.log('🔐 [FETCH_PLANS] Making request with token:', `${token.substring(0, 20)}...`);
            console.log('🔐 [FETCH_PLANS] Current axios headers:', axios.defaults.headers.common);
            console.log('🔐 [FETCH_PLANS] Request URL:', '/subscriptions/plans');
            
            const response = await axios.get('/subscriptions/plans');
            console.log('🔐 [FETCH_PLANS] Response received:', response.status, response.data);
            setPlans(response.data?.data || []);
        } catch (error) {
            console.error('🔐 [FETCH_PLANS] Error details:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                headers: error.response?.headers,
                data: error.response?.data,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    headers: error.config?.headers
                }
            });
            if (error.response?.status === 401) {
                showToast('Authentication required. Please log in again.', 'error');
            } else {
                showToast('Error fetching subscription plans', 'error');
            }
            setPlans([]); // Set empty array on error
        }
    };

    const fetchCoachSubscriptions = async () => {
        try {
            const token = getAuthToken();
            if (!token) {
                console.error('No auth token found');
                setCoachSubscriptions([]);
                return;
            }
            
            console.log('🔐 [FETCH_SUBSCRIPTIONS] Making request with token:', `${token.substring(0, 20)}...`);
            console.log('🔐 [FETCH_SUBSCRIPTIONS] Current axios headers:', axios.defaults.headers.common);
            console.log('🔐 [FETCH_SUBSCRIPTIONS] Request URL:', '/subscriptions/all');
            
            const response = await axios.get('/subscriptions/all');
            console.log('🔐 [FETCH_SUBSCRIPTIONS] Response received:', response.status, response.data);
            setCoachSubscriptions(response.data?.data || []);
        } catch (error) {
            console.error('🔐 [FETCH_SUBSCRIPTIONS] Error details:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                headers: error.response?.headers,
                data: error.response?.data,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    headers: error.config?.headers
                }
            });
            if (error.response?.status === 401) {
                showToast('Authentication required. Please log in again.', 'error');
            } else {
                showToast('Error fetching coach subscriptions', 'error');
            }
            setCoachSubscriptions([]); // Set empty array on error
        }
    };

    const fetchCoaches = async () => {
        try {
            const token = getAuthToken();
            if (!token) {
                console.error('No auth token found');
                setCoaches([]);
                return;
            }
            
            console.log('🔐 [FETCH_COACHES] Making request with token:', `${token.substring(0, 20)}...`);
            console.log('🔐 [FETCH_COACHES] Current axios headers:', axios.defaults.headers.common);
            console.log('🔐 [FETCH_COACHES] Request URL:', '/admin/users?role=coach');
            
            const response = await axios.get('/admin/users?role=coach');
            console.log('🔐 [FETCH_COACHES] Response received:', response.status, response.data);
            setCoaches(response.data?.data || []);
        } catch (error) {
            console.error('🔐 [FETCH_COACHES] Error details:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                headers: error.response?.headers,
                data: error.response?.data,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    headers: error.config?.headers
                }
            });
            if (error.response?.status === 401) {
                showToast('Authentication required. Please log in again.', 'error');
            } else {
                showToast('Error fetching coaches', 'error');
            }
            setCoaches([]); // Set empty array on error
        }
    };

    const createPlan = async () => {
        setSaving(true);
        try {
            await axios.post('/subscriptions/plans', planForm);
            showToast('Subscription plan created successfully', 'success');
            setPlanForm({
                name: '', description: '',
                price: { amount: '', currency: 'USD', billingCycle: 'monthly' },
                features: {
                    maxFunnels: 5, maxLeads: 1000, maxStaff: 3, maxAutomationRules: 10,
                    aiFeatures: false, advancedAnalytics: false, prioritySupport: false, customDomain: false
                },
                isPopular: false, sortOrder: 0
            });
            await fetchPlans();
        } catch (error) {
            console.error('Error creating plan:', error);
            showToast('Error creating subscription plan', 'error');
        } finally {
            setSaving(false);
        }
    };

    const deletePlan = async (planId) => {
        if (!confirm('Are you sure you want to delete this plan?')) return;
        try {
            await axios.delete(`/subscriptions/plans/${planId}`);
            showToast('Subscription plan deleted successfully', 'success');
            await fetchPlans();
        } catch (error) {
            console.error('Error deleting plan:', error);
            showToast('Error deleting subscription plan', 'error');
        }
    };

    const subscribeCoach = async () => {
        if (!subscriptionForm.coachId || !subscriptionForm.planId) {
            showToast('Please select both coach and plan', 'error');
            return;
        }
        setSaving(true);
        try {
            await axios.post('/subscriptions/subscribe-coach', subscriptionForm);
            showToast('Coach subscribed successfully', 'success');
            setSubscriptionForm({
                coachId: '', planId: '', billingCycle: 'monthly', autoRenew: true, notes: ''
            });
            await fetchCoachSubscriptions();
        } catch (error) {
            console.error('Error subscribing coach:', error);
            showToast('Error subscribing coach', 'error');
        } finally {
            setSaving(false);
        }
    };

    const cancelCoachSubscription = async (subscriptionId) => {
        if (!confirm('Are you sure you want to cancel this subscription?')) return;
        try {
            await axios.post('/subscriptions/cancel-coach', {
                subscriptionId, reason: 'Cancelled by admin'
            });
            showToast('Subscription cancelled successfully', 'success');
            await fetchCoachSubscriptions();
        } catch (error) {
            console.error('Error cancelling subscription:', error);
            showToast('Error cancelling subscription', 'error');
        }
    };

    // Advanced management functions
    const fetchSubscriptionDetails = async (subscriptionId) => {
        try {
            const response = await axios.get(`/subscriptions/subscription/${subscriptionId}`);
            setSubscriptionDetails(response.data?.data);
        } catch (error) {
            console.error('Error fetching subscription details:', error);
            showToast('Error fetching subscription details', 'error');
        }
    };

    const updateSubscriptionStatus = async (subscriptionId, status, reason = '') => {
        try {
            await axios.patch(`/subscriptions/subscription/${subscriptionId}/status`, { status, reason });
            showToast('Subscription status updated successfully', 'success');
            await fetchCoachSubscriptions();
            setSubscriptionDetails(null);
        } catch (error) {
            console.error('Error updating subscription status:', error);
            showToast('Error updating subscription status', 'error');
        }
    };

    const extendSubscription = async (subscriptionId, extendBy, billingCycle) => {
        try {
            await axios.post(`/api/subscriptions/subscription/${subscriptionId}/extend`, { extendBy, billingCycle });
            showToast('Subscription extended successfully', 'success');
            await fetchCoachSubscriptions();
        } catch (error) {
            console.error('Error extending subscription:', error);
            showToast('Error extending subscription', 'error');
        }
    };

    const searchSubscriptions = async () => {
        try {
            const params = new URLSearchParams();
            Object.entries(searchFilters).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });
            
            const response = await axios.get(`/api/subscriptions/search?${params}`);
            setSearchResults(response.data?.data || []);
            setPagination(response.data?.pagination || {});
        } catch (error) {
            console.error('Error searching subscriptions:', error);
            showToast('Error searching subscriptions', 'error');
        }
    };

    const fetchExpiringSubscriptions = async (days = 7) => {
        try {
            const response = await axios.get(`/api/subscriptions/expiring?days=${days}`);
            setExpiringSubscriptions(response.data?.data || []);
        } catch (error) {
            console.error('Error fetching expiring subscriptions:', error);
            showToast('Error fetching expiring subscriptions', 'error');
        }
    };

    const fetchRevenueAnalytics = async (period = 'month', startDate = '', endDate = '') => {
        try {
            const params = new URLSearchParams({ period });
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            
            const response = await axios.get(`/api/subscriptions/revenue?${params}`);
            setRevenueData(response.data?.data || {});
        } catch (error) {
            console.error('Error fetching revenue analytics:', error);
            showToast('Error fetching revenue analytics', 'error');
        }
    };

    const performBulkOperation = async () => {
        if (!bulkOperation.subscriptionIds.length) {
            showToast('Please select subscriptions for bulk operation', 'error');
            return;
        }

        try {
            await axios.post('/api/subscriptions/bulk-operations', bulkOperation);
            showToast(`Bulk ${bulkOperation.operation} completed successfully`, 'success');
            await fetchCoachSubscriptions();
            setBulkOperation({ operation: 'extend', subscriptionIds: [], data: {} });
        } catch (error) {
            console.error('Error performing bulk operation:', error);
            showToast('Error performing bulk operation', 'error');
        }
    };

    const exportSubscriptions = async (format = 'json') => {
        try {
            const response = await axios.get(`/api/subscriptions/export?format=${format}`, {
                responseType: format === 'csv' ? 'blob' : 'json'
            });
            
            if (format === 'csv') {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'subscriptions.csv');
                document.body.appendChild(link);
                link.click();
                link.remove();
            } else {
                const dataStr = JSON.stringify(response.data, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = window.URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'subscriptions.json');
                document.body.appendChild(link);
                link.click();
                link.remove();
            }
            
            showToast('Subscriptions exported successfully', 'success');
        } catch (error) {
            console.error('Error exporting subscriptions:', error);
            showToast('Error exporting subscriptions', 'error');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'default';
            case 'expired': return 'destructive';
            case 'cancelled': return 'secondary';
            case 'suspended': return 'destructive';
            case 'pending_renewal': return 'outline';
            default: return 'secondary';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg">Loading subscription data...</div>
            </div>
        );
    }

    // Check if we have auth token
    if (!getAuthToken()) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="text-lg text-red-600 mb-2">Authentication Required</div>
                    <div className="text-muted-foreground">Please log in to access subscription management</div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Subscription Management</h1>
                <p className="text-muted-foreground">
                    Manage subscription plans and coach subscriptions for the platform
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
                    <TabsTrigger value="coach-subscriptions">Coach Subscriptions</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced Management</TabsTrigger>
                    <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
                    <TabsTrigger value="bulk-operations">Bulk Operations</TabsTrigger>
                </TabsList>

                <TabsContent value="plans" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create New Subscription Plan</CardTitle>
                            <CardDescription>
                                Add a new subscription plan with features and pricing
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="planName">Plan Name</Label>
                                    <Input
                                        id="planName"
                                        value={planForm.name}
                                        onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                                        placeholder="e.g., Starter, Pro, Enterprise"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="planDescription">Description</Label>
                                    <Input
                                        id="planDescription"
                                        value={planForm.description}
                                        onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                                        placeholder="Brief description of the plan"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="planAmount">Price Amount</Label>
                                    <Input
                                        id="planAmount"
                                        type="number"
                                        step="0.01"
                                        value={planForm.price.amount}
                                        onChange={(e) => setPlanForm({
                                            ...planForm,
                                            price: { ...planForm.price, amount: parseFloat(e.target.value) }
                                        })}
                                        placeholder="e.g., 29.99"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="planCurrency">Currency</Label>
                                    <Select value={planForm.price.currency} onValueChange={(value) => setPlanForm({
                                        ...planForm,
                                        price: { ...planForm.price, currency: value }
                                    })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="USD">USD</SelectItem>
                                            <SelectItem value="EUR">EUR</SelectItem>
                                            <SelectItem value="GBP">GBP</SelectItem>
                                            <SelectItem value="INR">INR</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="planBillingCycle">Billing Cycle</Label>
                                    <Select value={planForm.price.billingCycle} onValueChange={(value) => setPlanForm({
                                        ...planForm,
                                        price: { ...planForm.price, billingCycle: value }
                                    })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                            <SelectItem value="quarterly">Quarterly</SelectItem>
                                            <SelectItem value="yearly">Yearly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Features & Limits</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="maxFunnels">Max Funnels</Label>
                                        <Input
                                            id="maxFunnels"
                                            type="number"
                                            value={planForm.features.maxFunnels}
                                            onChange={(e) => setPlanForm({
                                                ...planForm,
                                                features: { ...planForm.features, maxFunnels: parseInt(e.target.value) }
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="maxLeads">Max Leads</Label>
                                        <Input
                                            id="maxLeads"
                                            type="number"
                                            value={planForm.features.maxLeads}
                                            onChange={(e) => setPlanForm({
                                                ...planForm,
                                                features: { ...planForm.features, maxLeads: parseInt(e.target.value) }
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="maxStaff">Max Staff</Label>
                                        <Input
                                            id="maxStaff"
                                            type="number"
                                            value={planForm.features.maxStaff}
                                            onChange={(e) => setPlanForm({
                                                ...planForm,
                                                features: { ...planForm.features, maxStaff: parseInt(e.target.value) }
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="maxAutomationRules">Max Automation Rules</Label>
                                        <Input
                                            id="maxAutomationRules"
                                            type="number"
                                            value={planForm.features.maxAutomationRules}
                                            onChange={(e) => setPlanForm({
                                                ...planForm,
                                                features: { ...planForm.features, maxAutomationRules: parseInt(e.target.value) }
                                            })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="aiFeatures"
                                            checked={planForm.features.aiFeatures}
                                            onCheckedChange={(checked) => setPlanForm({
                                                ...planForm,
                                                features: { ...planForm.features, aiFeatures: checked }
                                            })}
                                        />
                                        <Label htmlFor="aiFeatures">AI Features</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="advancedAnalytics"
                                            checked={planForm.features.advancedAnalytics}
                                            onCheckedChange={(checked) => setPlanForm({
                                                ...planForm,
                                                features: { ...planForm.features, advancedAnalytics: checked }
                                            })}
                                        />
                                        <Label htmlFor="advancedAnalytics">Advanced Analytics</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="prioritySupport"
                                            checked={planForm.features.prioritySupport}
                                            onCheckedChange={(checked) => setPlanForm({
                                                ...planForm,
                                                features: { ...planForm.features, prioritySupport: checked }
                                            })}
                                        />
                                        <Label htmlFor="prioritySupport">Priority Support</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="customDomain"
                                            checked={planForm.features.customDomain}
                                            onCheckedChange={(checked) => setPlanForm({
                                                ...planForm,
                                                features: { ...planForm.features, customDomain: checked }
                                            })}
                                        />
                                        <Label htmlFor="customDomain">Custom Domain</Label>
                                    </div>
                                </div>
                            </div>

                            <Button onClick={createPlan} disabled={saving}>
                                {saving ? "Creating..." : "Create Subscription Plan"}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>All Subscription Plans</CardTitle>
                            <CardDescription>
                                Manage existing subscription plans and their features
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {Array.isArray(plans) && plans.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Billing Cycle</TableHead>
                                            <TableHead>Features</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {plans.map((plan) => (
                                            <TableRow key={plan._id}>
                                                <TableCell className="font-medium">
                                                    <div>
                                                        {plan.name}
                                                        {plan.isPopular && (
                                                            <Badge variant="default" className="ml-2">Popular</Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {plan.price.currency} {plan.price.amount}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {plan.price.billingCycle}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm space-y-1">
                                                        <div>Funnels: {plan.features.maxFunnels}</div>
                                                        <div>Leads: {plan.features.maxLeads}</div>
                                                        <div>Staff: {plan.features.maxStaff}</div>
                                                        {plan.features.aiFeatures && <Badge variant="secondary" className="text-xs">AI</Badge>}
                                                        {plan.features.advancedAnalytics && <Badge variant="secondary" className="text-xs">Analytics</Badge>}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={plan.isActive ? "default" : "secondary"}>
                                                        {plan.isActive ? "Active" : "Inactive"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => deletePlan(plan._id)}
                                                    >
                                                        Delete
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center text-muted-foreground py-8">
                                    No subscription plans created yet
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="coach-subscriptions" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Subscribe Coach to Plan</CardTitle>
                            <CardDescription>
                                Manually subscribe a coach to a subscription plan
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="coachSelect">Select Coach</Label>
                                    <Select onValueChange={(value) => setSubscriptionForm({ ...subscriptionForm, coachId: value })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose a coach" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.isArray(coaches) && coaches.map((coach) => (
                                                <SelectItem key={coach._id} value={coach._id}>
                                                    {coach.firstName} {coach.lastName} ({coach.email})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="planSelect">Select Plan</Label>
                                    <Select onValueChange={(value) => setSubscriptionForm({ ...subscriptionForm, planId: value })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose a plan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.isArray(plans) && plans.filter(p => p.isActive).map((plan) => (
                                                <SelectItem key={plan._id} value={plan._id}>
                                                    {plan.name} - {plan.price.currency} {plan.price.amount}/{plan.price.billingCycle}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="billingCycle">Billing Cycle</Label>
                                    <Select value={subscriptionForm.billingCycle} onValueChange={(value) => setSubscriptionForm({ ...subscriptionForm, billingCycle: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                            <SelectItem value="quarterly">Quarterly</SelectItem>
                                            <SelectItem value="yearly">Yearly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="autoRenew"
                                        checked={subscriptionForm.autoRenew}
                                        onCheckedChange={(checked) => setSubscriptionForm({ ...subscriptionForm, autoRenew: checked })}
                                    />
                                    <Label htmlFor="autoRenew">Auto Renew</Label>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="subscriptionNotes">Notes</Label>
                                <Textarea
                                    id="subscriptionNotes"
                                    value={subscriptionForm.notes}
                                    onChange={(e) => setSubscriptionForm({ ...subscriptionForm, notes: e.target.value })}
                                    placeholder="Optional notes about this subscription"
                                    rows={3}
                                />
                            </div>

                            <Button onClick={subscribeCoach} disabled={saving}>
                                {saving ? "Subscribing..." : "Subscribe Coach"}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Coach Subscriptions</CardTitle>
                            <CardDescription>
                                View and manage all coach subscriptions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {Array.isArray(coachSubscriptions) && coachSubscriptions.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Coach</TableHead>
                                            <TableHead>Plan</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Billing</TableHead>
                                            <TableHead>Period</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {coachSubscriptions.map((subscription) => (
                                            <TableRow key={subscription._id}>
                                                <TableCell className="font-medium">
                                                    {subscription.coachId?.firstName} {subscription.coachId?.lastName}
                                                    <div className="text-sm text-muted-foreground">
                                                        {subscription.coachId?.email}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        {subscription.planId?.name}
                                                        <div className="text-sm text-muted-foreground">
                                                            {subscription.billing.billingCycle}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={getStatusColor(subscription.status)}>
                                                        {subscription.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        {subscription.billing.currency} {subscription.billing.amount}
                                                        <div className="text-sm text-muted-foreground">
                                                            Next: {new Date(subscription.billing.nextBillingDate).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        <div>Start: {new Date(subscription.currentPeriod.startDate).toLocaleDateString()}</div>
                                                        <div>End: {new Date(subscription.currentPeriod.endDate).toLocaleDateString()}</div>
                                                        {subscription.daysUntilExpiry !== null && (
                                                            <div className={subscription.daysUntilExpiry <= 7 ? 'text-orange-600 font-medium' : ''}>
                                                                {subscription.daysUntilExpiry > 0 ? `${subscription.daysUntilExpiry} days left` : `${Math.abs(subscription.daysUntilExpiry)} days overdue`}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {subscription.status === 'active' && (
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => cancelCoachSubscription(subscription._id)}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center text-muted-foreground py-8">
                                    No coach subscriptions found
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{plans.length}</div>
                                <p className="text-xs text-muted-foreground">
                                    Active subscription plans
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">
                                    {coachSubscriptions.filter(s => s.status === 'active').length}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Currently active
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-orange-600">
                                    {coachSubscriptions.filter(s => s.daysUntilExpiry <= 7 && s.daysUntilExpiry > 0).length}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Within 7 days
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Expired</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">
                                    {coachSubscriptions.filter(s => s.status === 'expired').length}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Past due date
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Advanced Subscription Management</CardTitle>
                            <CardDescription>
                                Advanced tools for managing subscriptions, searching, and detailed operations
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Search and Filter Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Search & Filter Subscriptions</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="searchStatus">Status</Label>
                                        <Select value={searchFilters.status} onValueChange={(value) => setSearchFilters({ ...searchFilters, status: value })}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="All Statuses" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">All Statuses</SelectItem>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="expired">Expired</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                                <SelectItem value="suspended">Suspended</SelectItem>
                                                <SelectItem value="pending_renewal">Pending Renewal</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="searchPlan">Plan</Label>
                                        <Select value={searchFilters.planId} onValueChange={(value) => setSearchFilters({ ...searchFilters, planId: value })}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="All Plans" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">All Plans</SelectItem>
                                                {Array.isArray(plans) && plans.map((plan) => (
                                                    <SelectItem key={plan._id} value={plan._id}>{plan.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="searchCoach">Coach</Label>
                                        <Select value={searchFilters.coachId} onValueChange={(value) => setSearchFilters({ ...searchFilters, coachId: value })}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="All Coaches" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">All Coaches</SelectItem>
                                                {Array.isArray(coaches) && coaches.map((coach) => (
                                                    <SelectItem key={coach._id} value={coach._id}>{coach.firstName} {coach.lastName}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="startDate">Start Date</Label>
                                        <Input
                                            type="date"
                                            value={searchFilters.startDate}
                                            onChange={(e) => setSearchFilters({ ...searchFilters, startDate: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="endDate">End Date</Label>
                                        <Input
                                            type="date"
                                            value={searchFilters.endDate}
                                            onChange={(e) => setSearchFilters({ ...searchFilters, endDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <Button onClick={searchSubscriptions}>Search Subscriptions</Button>
                            </div>

                            {/* Search Results */}
                            {searchResults.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Search Results ({searchResults.length})</h3>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Coach</TableHead>
                                                <TableHead>Plan</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Period</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {searchResults.map((subscription) => (
                                                <TableRow key={subscription._id}>
                                                    <TableCell>
                                                        {subscription.coachId?.firstName} {subscription.coachId?.lastName}
                                                        <div className="text-sm text-muted-foreground">{subscription.coachId?.email}</div>
                                                    </TableCell>
                                                    <TableCell>{subscription.planId?.name}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={getStatusColor(subscription.status)}>
                                                            {subscription.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm">
                                                            {new Date(subscription.currentPeriod?.startDate).toLocaleDateString()} - {new Date(subscription.currentPeriod?.endDate).toLocaleDateString()}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => fetchSubscriptionDetails(subscription._id)}
                                                        >
                                                            View Details
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}

                            {/* Expiring Subscriptions */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">Expiring Subscriptions</h3>
                                    <Button onClick={() => fetchExpiringSubscriptions(7)} variant="outline">
                                        Refresh (7 days)
                                    </Button>
                                </div>
                                {expiringSubscriptions.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Coach</TableHead>
                                                <TableHead>Plan</TableHead>
                                                <TableHead>Expires On</TableHead>
                                                <TableHead>Days Left</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {expiringSubscriptions.map((subscription) => (
                                                <TableRow key={subscription._id}>
                                                    <TableCell>
                                                        {subscription.coachId?.firstName} {subscription.coachId?.lastName}
                                                    </TableCell>
                                                    <TableCell>{subscription.planId?.name}</TableCell>
                                                    <TableCell>
                                                        {new Date(subscription.currentPeriod?.endDate).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="destructive">
                                                            {Math.ceil((new Date(subscription.currentPeriod?.endDate) - new Date()) / (1000 * 60 * 60 * 24))} days
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => extendSubscription(subscription._id, 30, 'monthly')}
                                                        >
                                                            Extend 30 Days
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="text-center text-muted-foreground py-4">
                                        No expiring subscriptions found
                                    </div>
                                )}
                            </div>

                            {/* Export Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Export Data</h3>
                                <div className="flex space-x-2">
                                    <Button onClick={() => exportSubscriptions('json')} variant="outline">
                                        Export JSON
                                    </Button>
                                    <Button onClick={() => exportSubscriptions('csv')} variant="outline">
                                        Export CSV
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="revenue" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue Analytics</CardTitle>
                            <CardDescription>
                                Comprehensive revenue tracking and subscription analytics
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Revenue Controls */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="revenuePeriod">Period</Label>
                                    <Select onValueChange={(value) => fetchRevenueAnalytics(value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Period" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="month">Monthly</SelectItem>
                                            <SelectItem value="quarter">Quarterly</SelectItem>
                                            <SelectItem value="year">Yearly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="startDateRevenue">Start Date</Label>
                                    <Input
                                        type="date"
                                        onChange={(e) => setSearchFilters({ ...searchFilters, startDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="endDateRevenue">End Date</Label>
                                    <Input
                                        type="date"
                                        onChange={(e) => setSearchFilters({ ...searchFilters, endDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <Button onClick={() => fetchRevenueAnalytics('month', searchFilters.startDate, searchFilters.endDate)}>
                                Calculate Revenue
                            </Button>

                            {/* Revenue Display */}
                            {revenueData.totalRevenue !== undefined && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold text-green-600">
                                                    ${revenueData.totalRevenue?.toFixed(2) || '0.00'}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {revenueData.period} period
                                                </p>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">
                                                    {revenueData.activeSubscriptions || 0}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Currently generating revenue
                                                </p>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-medium">Average Revenue</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold text-blue-600">
                                                    ${revenueData.activeSubscriptions ? (revenueData.totalRevenue / revenueData.activeSubscriptions).toFixed(2) : '0.00'}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Per subscription
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Plan Revenue Breakdown */}
                                    {revenueData.planRevenue && Object.keys(revenueData.planRevenue).length > 0 && (
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold">Revenue by Plan</h3>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Plan Name</TableHead>
                                                        <TableHead>Revenue</TableHead>
                                                        <TableHead>Percentage</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {Object.entries(revenueData.planRevenue).map(([planName, revenue]) => (
                                                        <TableRow key={planName}>
                                                            <TableCell className="font-medium">{planName}</TableCell>
                                                            <TableCell>${revenue.toFixed(2)}</TableCell>
                                                            <TableCell>
                                                                {((revenue / revenueData.totalRevenue) * 100).toFixed(1)}%
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="bulk-operations" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Bulk Operations</CardTitle>
                            <CardDescription>
                                Perform operations on multiple subscriptions at once
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Bulk Operation Controls */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="bulkOperation">Operation Type</Label>
                                    <Select value={bulkOperation.operation} onValueChange={(value) => setBulkOperation({ ...bulkOperation, operation: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="extend">Extend Subscriptions</SelectItem>
                                            <SelectItem value="suspend">Suspend Subscriptions</SelectItem>
                                            <SelectItem value="activate">Activate Subscriptions</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bulkData">Operation Data</Label>
                                    <Input
                                        placeholder={bulkOperation.operation === 'extend' ? 'Days to extend' : 'Reason'}
                                        value={bulkOperation.data.value || ''}
                                        onChange={(e) => setBulkOperation({
                                            ...bulkOperation,
                                            data: { ...bulkOperation.data, value: e.target.value }
                                        })}
                                    />
                                </div>
                            </div>

                            {/* Subscription Selection */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Select Subscriptions</h3>
                                <div className="max-h-64 overflow-y-auto border rounded-md p-4">
                                    {Array.isArray(coachSubscriptions) && coachSubscriptions.map((subscription) => (
                                        <div key={subscription._id} className="flex items-center space-x-2 py-2">
                                            <input
                                                type="checkbox"
                                                id={subscription._id}
                                                checked={bulkOperation.subscriptionIds.includes(subscription._id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setBulkOperation({
                                                            ...bulkOperation,
                                                            subscriptionIds: [...bulkOperation.subscriptionIds, subscription._id]
                                                        });
                                                    } else {
                                                        setBulkOperation({
                                                            ...bulkOperation,
                                                            subscriptionIds: bulkOperation.subscriptionIds.filter(id => id !== subscription._id)
                                                        });
                                                    }
                                                }}
                                            />
                                            <label htmlFor={subscription._id} className="text-sm">
                                                {subscription.coachId?.firstName} {subscription.coachId?.lastName} - {subscription.planId?.name} ({subscription.status})
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        {bulkOperation.subscriptionIds.length} subscriptions selected
                                    </span>
                                    <Button
                                        onClick={performBulkOperation}
                                        disabled={!bulkOperation.subscriptionIds.length}
                                    >
                                        Perform Bulk {bulkOperation.operation.charAt(0).toUpperCase() + bulkOperation.operation.slice(1)}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Subscription Details Modal */}
            {subscriptionDetails && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">Subscription Details</h2>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSubscriptionDetails(null)}
                            >
                                ✕
                            </Button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h3 className="font-semibold mb-2">Coach Information</h3>
                                    <div className="space-y-1 text-sm">
                                        <div><strong>Name:</strong> {subscriptionDetails.coachId?.firstName} {subscriptionDetails.coachId?.lastName}</div>
                                        <div><strong>Email:</strong> {subscriptionDetails.coachId?.email}</div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2">Plan Information</h3>
                                    <div className="space-y-1 text-sm">
                                        <div><strong>Plan:</strong> {subscriptionDetails.planId?.name}</div>
                                        <div><strong>Price:</strong> {subscriptionDetails.billing?.currency} {subscriptionDetails.billing?.amount}</div>
                                        <div><strong>Billing Cycle:</strong> {subscriptionDetails.billing?.billingCycle}</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="font-semibold mb-2">Subscription Status</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Badge variant={getStatusColor(subscriptionDetails.status)}>
                                            {subscriptionDetails.status}
                                        </Badge>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                const newStatus = prompt('Enter new status (active, expired, cancelled, suspended, pending_renewal):');
                                                if (newStatus) {
                                                    updateSubscriptionStatus(subscriptionDetails._id, newStatus);
                                                }
                                            }}
                                        >
                                            Change Status
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h3 className="font-semibold mb-2">Current Period</h3>
                                    <div className="space-y-1 text-sm">
                                        <div><strong>Start:</strong> {new Date(subscriptionDetails.currentPeriod?.startDate).toLocaleDateString()}</div>
                                        <div><strong>End:</strong> {new Date(subscriptionDetails.currentPeriod?.endDate).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2">Billing Information</h3>
                                    <div className="space-y-1 text-sm">
                                        <div><strong>Next Billing:</strong> {new Date(subscriptionDetails.billing?.nextBillingDate).toLocaleDateString()}</div>
                                        <div><strong>Payment Status:</strong> {subscriptionDetails.billing?.paymentStatus}</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex space-x-2">
                                <Button
                                    onClick={() => {
                                        const days = prompt('Enter number of days to extend:');
                                        if (days) {
                                            extendSubscription(subscriptionDetails._id, parseInt(days), 'monthly');
                                        }
                                    }}
                                    variant="outline"
                                >
                                    Extend Subscription
                                </Button>
                                <Button
                                    onClick={() => setSubscriptionDetails(null)}
                                    variant="outline"
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubscriptionManagement;
