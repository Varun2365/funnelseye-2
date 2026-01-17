import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { useToast } from '../contexts/ToastContext';
import { 
    DollarSign, 
    CreditCard, 
    TrendingUp, 
    TrendingDown, 
    Users, 
    Package, 
    Settings, 
    RefreshCw,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Clock,
    BarChart3,
    PieChart,
    Activity,
    Banknote,
    Zap,
    Shield,
    Download,
    Upload,
    Eye,
    Edit,
    Trash2,
    Plus,
    Minus,
    ArrowUpDown,
    Target,
    Percent,
    Calendar,
    Filter,
    Search,
    ArrowRight,
    ArrowLeft,
    ExternalLink
} from 'lucide-react';
import axios from 'axios';

// Custom hook for coach financial API calls
const useCoachFinancialAPI = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const apiCall = useCallback(async (endpoint, options = {}) => {
        setLoading(true);
        setError(null);
        
        try {
            const token = localStorage.getItem('coachToken') || localStorage.getItem('token');
            const response = await axios({
                url: endpoint,
                method: options.method || 'GET',
                data: options.data,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000,
                ...options
            });
            
            if (!response.data.success) {
                throw new Error(response.data.message || 'API call failed');
            }
            
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    return { apiCall, loading, error };
};

const CoachFinancialDashboard = () => {
    const { toast } = useToast();
    const { apiCall, loading, error } = useCoachFinancialAPI();
    
    // State management
    const [activeTab, setActiveTab] = useState('overview');
    const [refreshKey, setRefreshKey] = useState(0);
    
    // Revenue Data
    const [revenueData, setRevenueData] = useState({
        revenue: {
            total: 0,
            monthly: 0,
            yearly: 0,
            byPeriod: []
        },
        commissions: {
            total: 0,
            count: 0,
            breakdown: []
        },
        metrics: {
            totalSubscriptions: 0,
            averageRevenuePerSubscription: 0,
            timeRange: 30,
            period: 'daily'
        }
    });
    
    // Payment History
    const [paymentHistory, setPaymentHistory] = useState({
        payments: [],
        pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            hasNext: false,
            hasPrev: false
        }
    });
    
    // Razorpay Balance
    const [balanceData, setBalanceData] = useState({
        balance: 0,
        currency: 'INR',
        accountId: '',
        accountName: '',
        availableForPayout: 0
    });
    
    // Payout History
    const [payoutHistory, setPayoutHistory] = useState({
        payouts: [],
        pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            hasNext: false,
            hasPrev: false
        }
    });
    
    // MLM Commission Structure
    const [mlmCommission, setMlmCommission] = useState({
        commissionStructure: {
            levels: [],
            platformFeePercentage: 0,
            maxLevels: 0
        },
        commissionHistory: [],
        totalCommissionsEarned: 0
    });
    
    // Payout Settings
    const [payoutSettings, setPayoutSettings] = useState({
        autoPayoutEnabled: false,
        payoutMethod: 'UPI',
        upiId: '',
        bankAccount: {
            accountHolderName: '',
            accountNumber: '',
            ifscCode: ''
        },
        minimumAmount: 100,
        payoutFrequency: 'weekly',
        commissionPercentage: 0
    });
    
    // Refund History
    const [refundHistory, setRefundHistory] = useState({
        refunds: [],
        pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            hasNext: false,
            hasPrev: false
        }
    });
    
    // Dialog states
    const [isPayoutDialogOpen, setIsPayoutDialogOpen] = useState(false);
    const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
    const [isCoachPayoutDialogOpen, setIsCoachPayoutDialogOpen] = useState(false);
    
    // Payout form data
    const [payoutForm, setPayoutForm] = useState({
        amount: '',
        payoutMethod: 'UPI',
        upiId: '',
        bankAccount: {
            accountHolderName: '',
            accountNumber: '',
            ifscCode: ''
        },
        notes: ''
    });
    
    // Coach payout form data
    const [coachPayoutForm, setCoachPayoutForm] = useState({
        targetCoachId: '',
        amount: '',
        notes: ''
    });

    // Load revenue data
    const loadRevenueData = useCallback(async () => {
        try {
            const data = await apiCall('/api/coach/financial/revenue?timeRange=30&period=daily');
            setRevenueData(data.data);
        } catch (err) {
            console.error('Error loading revenue data:', err);
        }
    }, [apiCall]);

    // Load payment history
    const loadPaymentHistory = useCallback(async (page = 1, limit = 20) => {
        try {
            const data = await apiCall(`/api/coach/financial/payments?page=${page}&limit=${limit}`);
            setPaymentHistory(data.data);
        } catch (err) {
            console.error('Error loading payment history:', err);
        }
    }, [apiCall]);

    // Load balance data
    const loadBalanceData = useCallback(async () => {
        try {
            const data = await apiCall('/api/coach/financial/balance');
            setBalanceData(data.data);
        } catch (err) {
            console.error('Error loading balance data:', err);
        }
    }, [apiCall]);

    // Load payout history
    const loadPayoutHistory = useCallback(async (page = 1, limit = 20) => {
        try {
            const data = await apiCall(`/api/coach/financial/payouts?page=${page}&limit=${limit}`);
            setPayoutHistory(data.data);
        } catch (err) {
            console.error('Error loading payout history:', err);
        }
    }, [apiCall]);

    // Load MLM commission data
    const loadMlmCommission = useCallback(async () => {
        try {
            const data = await apiCall('/api/coach/financial/mlm-commission');
            setMlmCommission(data.data);
        } catch (err) {
            console.error('Error loading MLM commission:', err);
        }
    }, [apiCall]);

    // Load refund history
    const loadRefundHistory = useCallback(async (page = 1, limit = 20) => {
        try {
            const data = await apiCall(`/api/coach/financial/refunds?page=${page}&limit=${limit}`);
            setRefundHistory(data.data);
        } catch (err) {
            console.error('Error loading refund history:', err);
        }
    }, [apiCall]);

    // Create manual payout
    const createManualPayout = async () => {
        try {
            await apiCall('/api/coach/financial/payout', {
                method: 'POST',
                data: payoutForm
            });
            toast({
                title: "Success",
                description: "Payout created successfully",
                variant: "default"
            });
            setIsPayoutDialogOpen(false);
            setPayoutForm({
                amount: '',
                payoutMethod: 'UPI',
                upiId: '',
                bankAccount: {
                    accountHolderName: '',
                    accountNumber: '',
                    ifscCode: ''
                },
                notes: ''
            });
            loadPayoutHistory();
            loadBalanceData();
        } catch (err) {
            toast({
                title: "Error",
                description: err.message,
                variant: "destructive"
            });
        }
    };

    // Update payout settings
    const updatePayoutSettings = async () => {
        try {
            await apiCall('/api/coach/financial/payout-settings', {
                method: 'PUT',
                data: payoutSettings
            });
            toast({
                title: "Success",
                description: "Payout settings updated successfully",
                variant: "default"
            });
            setIsSettingsDialogOpen(false);
        } catch (err) {
            toast({
                title: "Error",
                description: err.message,
                variant: "destructive"
            });
        }
    };

    // Payout to another coach
    const payoutToCoach = async () => {
        try {
            await apiCall('/api/coach/financial/payout-to-coach', {
                method: 'POST',
                data: coachPayoutForm
            });
            toast({
                title: "Success",
                description: "Payout to coach created successfully",
                variant: "default"
            });
            setIsCoachPayoutDialogOpen(false);
            setCoachPayoutForm({
                targetCoachId: '',
                amount: '',
                notes: ''
            });
            loadPayoutHistory();
            loadBalanceData();
        } catch (err) {
            toast({
                title: "Error",
                description: err.message,
                variant: "destructive"
            });
        }
    };

    // Refresh all data
    const refreshData = () => {
        setRefreshKey(prev => prev + 1);
        loadRevenueData();
        loadPaymentHistory();
        loadBalanceData();
        loadPayoutHistory();
        loadMlmCommission();
        loadRefundHistory();
    };

    // Load data on component mount
    useEffect(() => {
        refreshData();
    }, []);

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    // Format percentage
    const formatPercentage = (value) => {
        return `${value}%`;
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Financial Dashboard</h1>
                    <p className="text-muted-foreground">
                        Manage your revenue, payouts, and MLM commissions
                    </p>
                </div>
                <Button onClick={refreshData} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh Data
                </Button>
            </div>

            {/* Error Alert */}
            {error && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="revenue">Revenue</TabsTrigger>
                    <TabsTrigger value="payments">Payments</TabsTrigger>
                    <TabsTrigger value="payouts">Payouts</TabsTrigger>
                    <TabsTrigger value="commission">Commission</TabsTrigger>
                    <TabsTrigger value="refunds">Refunds</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    {/* Key Metrics Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(revenueData.revenue.total)}</div>
                                <p className="text-xs text-muted-foreground">
                                    Last {revenueData.metrics.timeRange} days
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
                                <Banknote className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{formatCurrency(balanceData.availableForPayout)}</div>
                                <p className="text-xs text-muted-foreground">
                                    Ready for payout
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Commissions Earned</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(revenueData.commissions.total)}</div>
                                <p className="text-xs text-muted-foreground">
                                    {revenueData.commissions.count} commissions
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{revenueData.metrics.totalSubscriptions}</div>
                                <p className="text-xs text-muted-foreground">
                                    Currently active
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>Common financial operations</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                <Dialog open={isPayoutDialogOpen} onOpenChange={setIsPayoutDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button>
                                            <ArrowUpDown className="h-4 w-4 mr-2" />
                                            Create Payout
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>Create Manual Payout</DialogTitle>
                                            <DialogDescription>
                                                Transfer funds to your account
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div>
                                                <Label>Amount (INR)</Label>
                                                <Input 
                                                    type="number"
                                                    value={payoutForm.amount}
                                                    onChange={(e) => setPayoutForm(prev => ({
                                                        ...prev,
                                                        amount: e.target.value
                                                    }))}
                                                    placeholder="Enter amount"
                                                />
                                            </div>
                                            <div>
                                                <Label>Payout Method</Label>
                                                <Select 
                                                    value={payoutForm.payoutMethod}
                                                    onValueChange={(value) => setPayoutForm(prev => ({
                                                        ...prev,
                                                        payoutMethod: value
                                                    }))}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="UPI">UPI</SelectItem>
                                                        <SelectItem value="BANK">Bank Transfer</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            {payoutForm.payoutMethod === 'UPI' && (
                                                <div>
                                                    <Label>UPI ID</Label>
                                                    <Input 
                                                        value={payoutForm.upiId}
                                                        onChange={(e) => setPayoutForm(prev => ({
                                                            ...prev,
                                                            upiId: e.target.value
                                                        }))}
                                                        placeholder="Enter UPI ID"
                                                    />
                                                </div>
                                            )}
                                            {payoutForm.payoutMethod === 'BANK' && (
                                                <div className="space-y-2">
                                                    <div>
                                                        <Label>Account Holder Name</Label>
                                                        <Input 
                                                            value={payoutForm.bankAccount.accountHolderName}
                                                            onChange={(e) => setPayoutForm(prev => ({
                                                                ...prev,
                                                                bankAccount: {
                                                                    ...prev.bankAccount,
                                                                    accountHolderName: e.target.value
                                                                }
                                                            }))}
                                                            placeholder="Enter account holder name"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Account Number</Label>
                                                        <Input 
                                                            value={payoutForm.bankAccount.accountNumber}
                                                            onChange={(e) => setPayoutForm(prev => ({
                                                                ...prev,
                                                                bankAccount: {
                                                                    ...prev.bankAccount,
                                                                    accountNumber: e.target.value
                                                                }
                                                            }))}
                                                            placeholder="Enter account number"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>IFSC Code</Label>
                                                        <Input 
                                                            value={payoutForm.bankAccount.ifscCode}
                                                            onChange={(e) => setPayoutForm(prev => ({
                                                                ...prev,
                                                                bankAccount: {
                                                                    ...prev.bankAccount,
                                                                    ifscCode: e.target.value
                                                                }
                                                            }))}
                                                            placeholder="Enter IFSC code"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            <div>
                                                <Label>Notes (Optional)</Label>
                                                <Textarea 
                                                    value={payoutForm.notes}
                                                    onChange={(e) => setPayoutForm(prev => ({
                                                        ...prev,
                                                        notes: e.target.value
                                                    }))}
                                                    placeholder="Add notes"
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsPayoutDialogOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button onClick={createManualPayout}>
                                                Create Payout
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>

                                <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline">
                                            <Settings className="h-4 w-4 mr-2" />
                                            Payout Settings
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>Payout Settings</DialogTitle>
                                            <DialogDescription>
                                                Configure automatic payout preferences
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div className="flex items-center space-x-2">
                                                <Switch 
                                                    checked={payoutSettings.autoPayoutEnabled}
                                                    onCheckedChange={(checked) => setPayoutSettings(prev => ({
                                                        ...prev,
                                                        autoPayoutEnabled: checked
                                                    }))}
                                                />
                                                <Label>Enable Automatic Payouts</Label>
                                            </div>
                                            <div>
                                                <Label>Payout Method</Label>
                                                <Select 
                                                    value={payoutSettings.payoutMethod}
                                                    onValueChange={(value) => setPayoutSettings(prev => ({
                                                        ...prev,
                                                        payoutMethod: value
                                                    }))}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="UPI">UPI</SelectItem>
                                                        <SelectItem value="BANK">Bank Transfer</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label>UPI ID</Label>
                                                <Input 
                                                    value={payoutSettings.upiId}
                                                    onChange={(e) => setPayoutSettings(prev => ({
                                                        ...prev,
                                                        upiId: e.target.value
                                                    }))}
                                                    placeholder="Enter UPI ID"
                                                />
                                            </div>
                                            <div>
                                                <Label>Minimum Amount (INR)</Label>
                                                <Input 
                                                    type="number"
                                                    value={payoutSettings.minimumAmount}
                                                    onChange={(e) => setPayoutSettings(prev => ({
                                                        ...prev,
                                                        minimumAmount: parseInt(e.target.value)
                                                    }))}
                                                    placeholder="Enter minimum amount"
                                                />
                                            </div>
                                            <div>
                                                <Label>Payout Frequency</Label>
                                                <Select 
                                                    value={payoutSettings.payoutFrequency}
                                                    onValueChange={(value) => setPayoutSettings(prev => ({
                                                        ...prev,
                                                        payoutFrequency: value
                                                    }))}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="daily">Daily</SelectItem>
                                                        <SelectItem value="weekly">Weekly</SelectItem>
                                                        <SelectItem value="monthly">Monthly</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsSettingsDialogOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button onClick={updatePayoutSettings}>
                                                Save Settings
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>

                                <Dialog open={isCoachPayoutDialogOpen} onOpenChange={setIsCoachPayoutDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline">
                                            <Users className="h-4 w-4 mr-2" />
                                            Payout to Coach
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>Payout to Another Coach</DialogTitle>
                                            <DialogDescription>
                                                Transfer funds to another coach
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div>
                                                <Label>Target Coach ID</Label>
                                                <Input 
                                                    value={coachPayoutForm.targetCoachId}
                                                    onChange={(e) => setCoachPayoutForm(prev => ({
                                                        ...prev,
                                                        targetCoachId: e.target.value
                                                    }))}
                                                    placeholder="Enter coach ID"
                                                />
                                            </div>
                                            <div>
                                                <Label>Amount (INR)</Label>
                                                <Input 
                                                    type="number"
                                                    value={coachPayoutForm.amount}
                                                    onChange={(e) => setCoachPayoutForm(prev => ({
                                                        ...prev,
                                                        amount: e.target.value
                                                    }))}
                                                    placeholder="Enter amount"
                                                />
                                            </div>
                                            <div>
                                                <Label>Notes (Optional)</Label>
                                                <Textarea 
                                                    value={coachPayoutForm.notes}
                                                    onChange={(e) => setCoachPayoutForm(prev => ({
                                                        ...prev,
                                                        notes: e.target.value
                                                    }))}
                                                    placeholder="Add notes"
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsCoachPayoutDialogOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button onClick={payoutToCoach}>
                                                Create Payout
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Revenue Tab */}
                <TabsContent value="revenue" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Revenue Analytics
                            </CardTitle>
                            <CardDescription>
                                Track your revenue performance over time
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {/* Revenue Summary */}
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="text-center p-4 border rounded-lg">
                                        <div className="text-2xl font-bold">{formatCurrency(revenueData.revenue.total)}</div>
                                        <div className="text-sm text-muted-foreground">Total Revenue</div>
                                    </div>
                                    <div className="text-center p-4 border rounded-lg">
                                        <div className="text-2xl font-bold">{formatCurrency(revenueData.revenue.monthly)}</div>
                                        <div className="text-sm text-muted-foreground">Monthly Revenue</div>
                                    </div>
                                    <div className="text-center p-4 border rounded-lg">
                                        <div className="text-2xl font-bold">{formatCurrency(revenueData.revenue.yearly)}</div>
                                        <div className="text-sm text-muted-foreground">Yearly Revenue</div>
                                    </div>
                                </div>

                                {/* Revenue by Period Chart */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Revenue by Period</h3>
                                    <div className="space-y-2">
                                        {revenueData.revenue.byPeriod.map((period, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">{period.date}</span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-semibold">{formatCurrency(period.amount)}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Payments Tab */}
                <TabsContent value="payments" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Payment History
                            </CardTitle>
                            <CardDescription>
                                View all your subscription payments
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Plan</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Payment ID</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paymentHistory.payments.map((payment, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-semibold">{formatCurrency(payment.amount)}</TableCell>
                                                <TableCell>
                                                    <Badge variant={payment.status === 'active' ? 'default' : 'secondary'}>
                                                        {payment.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{payment.plan}</TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{payment.customer.name}</div>
                                                        <div className="text-sm text-muted-foreground">{payment.customer.email}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{formatDate(payment.createdAt)}</TableCell>
                                                <TableCell className="font-mono text-sm">
                                                    {payment.razorpayPaymentId ? payment.razorpayPaymentId.substring(0, 12) + '...' : 'N/A'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {/* Pagination */}
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {paymentHistory.payments.length} of {paymentHistory.pagination.totalItems} payments
                                    </div>
                                    <div className="flex gap-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            disabled={!paymentHistory.pagination.hasPrev}
                                            onClick={() => loadPaymentHistory(paymentHistory.pagination.currentPage - 1)}
                                        >
                                            <ArrowLeft className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            disabled={!paymentHistory.pagination.hasNext}
                                            onClick={() => loadPaymentHistory(paymentHistory.pagination.currentPage + 1)}
                                        >
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Payouts Tab */}
                <TabsContent value="payouts" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ArrowUpDown className="h-5 w-5" />
                                Payout History
                            </CardTitle>
                            <CardDescription>
                                Track all your payouts and transfers
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Method</TableHead>
                                            <TableHead>Purpose</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Reference ID</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {payoutHistory.payouts.map((payout, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-semibold">{formatCurrency(payout.amount)}</TableCell>
                                                <TableCell>
                                                    <Badge variant={payout.status === 'processed' ? 'default' : 'secondary'}>
                                                        {payout.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{payout.mode}</TableCell>
                                                <TableCell>{payout.purpose}</TableCell>
                                                <TableCell>{formatDate(payout.createdAt)}</TableCell>
                                                <TableCell className="font-mono text-sm">
                                                    {payout.referenceId ? payout.referenceId.substring(0, 12) + '...' : 'N/A'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {/* Pagination */}
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {payoutHistory.payouts.length} of {payoutHistory.pagination.totalItems} payouts
                                    </div>
                                    <div className="flex gap-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            disabled={!payoutHistory.pagination.hasPrev}
                                            onClick={() => loadPayoutHistory(payoutHistory.pagination.currentPage - 1)}
                                        >
                                            <ArrowLeft className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            disabled={!payoutHistory.pagination.hasNext}
                                            onClick={() => loadPayoutHistory(payoutHistory.pagination.currentPage + 1)}
                                        >
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Commission Tab */}
                <TabsContent value="commission" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                MLM Commission Structure
                            </CardTitle>
                            <CardDescription>
                                View your commission structure and earnings
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {/* Commission Structure */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Commission Levels</h3>
                                    <div className="space-y-3">
                                        {mlmCommission.commissionStructure.levels.map((level, index) => (
                                            <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline">Level {level.level}</Badge>
                                                    <span className="font-medium">{formatPercentage(level.percentage)}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <Progress value={level.percentage} className="h-2" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Commission Summary */}
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="text-center p-4 border rounded-lg">
                                        <div className="text-2xl font-bold">{formatCurrency(mlmCommission.totalCommissionsEarned)}</div>
                                        <div className="text-sm text-muted-foreground">Total Commissions Earned</div>
                                    </div>
                                    <div className="text-center p-4 border rounded-lg">
                                        <div className="text-2xl font-bold">{formatPercentage(mlmCommission.commissionStructure.platformFeePercentage)}</div>
                                        <div className="text-sm text-muted-foreground">Platform Fee</div>
                                    </div>
                                </div>

                                {/* Commission History */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Recent Commissions</h3>
                                    <div className="space-y-2">
                                        {mlmCommission.commissionHistory.slice(0, 10).map((commission, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <Badge variant="outline">Level {commission.level}</Badge>
                                                    <span className="font-medium">{formatPercentage(commission.percentage)}</span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-semibold">{formatCurrency(commission.amount)}</div>
                                                    <div className="text-sm text-muted-foreground">{formatDate(commission.createdAt)}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Refunds Tab */}
                <TabsContent value="refunds" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ArrowDown className="h-5 w-5" />
                                Refund History
                            </CardTitle>
                            <CardDescription>
                                Track all refunds processed
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Reason</TableHead>
                                            <TableHead>Original Payment</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Refund ID</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {refundHistory.refunds.map((refund, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-semibold">{formatCurrency(refund.amount)}</TableCell>
                                                <TableCell>
                                                    <Badge variant={refund.status === 'processed' ? 'default' : 'secondary'}>
                                                        {refund.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{refund.reason}</TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{formatCurrency(refund.originalPayment.amount)}</div>
                                                        <div className="text-sm text-muted-foreground">{refund.originalPayment.plan}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{formatDate(refund.createdAt)}</TableCell>
                                                <TableCell className="font-mono text-sm">
                                                    {refund.refundId ? refund.refundId.substring(0, 12) + '...' : 'N/A'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {/* Pagination */}
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {refundHistory.refunds.length} of {refundHistory.pagination.totalItems} refunds
                                    </div>
                                    <div className="flex gap-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            disabled={!refundHistory.pagination.hasPrev}
                                            onClick={() => loadRefundHistory(refundHistory.pagination.currentPage - 1)}
                                        >
                                            <ArrowLeft className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            disabled={!refundHistory.pagination.hasNext}
                                            onClick={() => loadRefundHistory(refundHistory.pagination.currentPage + 1)}
                                        >
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default CoachFinancialDashboard;
