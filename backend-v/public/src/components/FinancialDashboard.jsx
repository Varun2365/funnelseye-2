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
    Activity
} from 'lucide-react';
import axios from 'axios';

// Custom hook for API calls with better error handling
const useFinancialAPI = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const apiCall = useCallback(async (endpoint, options = {}) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await axios({
                url: endpoint,
                method: options.method || 'GET',
                data: options.data,
                timeout: 5000, // 5 second timeout
                ...options
            });
            
            if (!response.data.success) {
                throw new Error(response.data.message || 'API call failed');
            }
            
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Unknown error occurred';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    return { apiCall, loading, error };
};

const FinancialDashboard = () => {
    const { showToast } = useToast();
    const { apiCall, loading, error } = useFinancialAPI();
    
    // State management
    const [activeTab, setActiveTab] = useState('overview');
    const [timeRange, setTimeRange] = useState(30);
    const [timeoutCount, setTimeoutCount] = useState(0);
    const [data, setData] = useState({
        overview: null,
        creditSystem: null,
        creditPackages: [],
        revenueAnalytics: null,
        paymentFailures: null,
        gatewayMarkup: null,
        creditUsage: null,
        paymentGateways: [],
        commissionPayouts: null,
        paymentAnalytics: null
    });

    // Fetch data function with proper error handling and timeout management
    const fetchData = useCallback(async (endpoint, dataKey) => {
        try {
            console.log(`🔄 [FINANCIAL] Fetching ${dataKey}...`);
            const result = await apiCall(endpoint);
            setData(prev => ({ ...prev, [dataKey]: result.data }));
            console.log(`✅ [FINANCIAL] ${dataKey} fetched successfully`);
            return result.data;
        } catch (err) {
            console.error(`❌ [FINANCIAL] Error fetching ${dataKey}:`, err.message);
            
            // Check if it's a timeout error
            if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
                showToast(`${dataKey} request timed out (5s)`, 'warning');
                setTimeoutCount(prev => prev + 1);
            } else {
                showToast(`Failed to load ${dataKey}`, 'error');
            }
            
            // Set empty data so page still renders
            setData(prev => ({ ...prev, [dataKey]: null }));
            return null;
        }
    }, [apiCall, showToast]);

    // Load overview data with timeout handling
    const loadOverview = useCallback(async () => {
        console.log('🔄 [FINANCIAL] Loading overview data...');
        
        const promises = [
            fetchData('/admin/financial/revenue-analytics', 'revenueAnalytics'),
            fetchData('/admin/financial/payment-failures', 'paymentFailures'),
            fetchData('/admin/financial/credit-usage', 'creditUsage'),
            fetchData('/admin/financial/payment-analytics', 'paymentAnalytics')
        ];

        const results = await Promise.allSettled(promises);
        
        // Create overview summary with fallback values
        const overview = {
            totalRevenue: results[0].value?.totalRevenue || 0,
            totalTransactions: results[0].value?.totalTransactions || 0,
            failureRate: results[1].value?.failureRate || 0,
            creditUsage: results[2].value?.totalUsage || 0,
            activeGateways: results[3].value?.gatewayStats?.length || 0
        };

        console.log('✅ [FINANCIAL] Overview data loaded:', overview);
        setData(prev => ({ ...prev, overview }));
    }, [fetchData]);

    // Load tab-specific data
    const loadTabData = useCallback(async (tab) => {
        switch (tab) {
            case 'overview':
                await loadOverview();
                break;
            case 'credits':
                await Promise.allSettled([
                    fetchData('/admin/financial/credit-system', 'creditSystem'),
                    fetchData('/admin/financial/credit-packages', 'creditPackages')
                ]);
                break;
            case 'analytics':
                await Promise.allSettled([
                    fetchData('/admin/financial/revenue-analytics', 'revenueAnalytics'),
                    fetchData('/admin/financial/payment-failures', 'paymentFailures'),
                    fetchData('/admin/financial/gateway-markup', 'gatewayMarkup'),
                    fetchData('/admin/financial/credit-usage', 'creditUsage')
                ]);
                break;
            case 'gateways':
                await Promise.allSettled([
                    fetchData('/admin/financial/payment-gateways', 'paymentGateways'),
                    fetchData('/admin/financial/payment-settings', 'paymentSettings')
                ]);
                break;
            case 'payouts':
                await fetchData('/admin/financial/commission-payouts', 'commissionPayouts');
                break;
            case 'reports':
                await fetchData('/admin/financial/payment-analytics', 'paymentAnalytics');
                break;
        }
    }, [fetchData, loadOverview]);

    // Handle tab change
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        loadTabData(tab);
    };

    // Refresh data
    const refreshData = () => {
        setTimeoutCount(0); // Reset timeout count
        loadTabData(activeTab);
    };

    // Initial load
    useEffect(() => {
        loadTabData(activeTab);
    }, [loadTabData, activeTab]);

    // Always render the page, even if data is loading or has errors
    // The page will show loading states for individual components instead

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Financial Dashboard</h1>
                    <p className="text-muted-foreground">
                        Comprehensive financial analytics and management
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                    <Select value={timeRange.toString()} onValueChange={(value) => setTimeRange(parseInt(value))}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7">7 days</SelectItem>
                            <SelectItem value="30">30 days</SelectItem>
                            <SelectItem value="90">90 days</SelectItem>
                            <SelectItem value="365">1 year</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={refreshData} variant="outline" disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    {loading && (
                        <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 mr-1" />
                            Loading... (5s timeout)
                        </div>
                    )}
                </div>
            </div>

            {/* Timeout Warning Banner */}
            {timeoutCount > 0 && (
                <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                        <div className="flex items-center justify-between">
                            <span>
                                {timeoutCount} API request{timeoutCount > 1 ? 's' : ''} timed out (5s limit). 
                                Some data may not be available.
                            </span>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => {
                                    setTimeoutCount(0);
                                    refreshData();
                                }}
                                className="ml-4"
                            >
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Retry All
                            </Button>
                        </div>
                    </AlertDescription>
                </Alert>
            )}

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                        {loading ? (
                            <div className="animate-pulse">
                                <div className="h-8 bg-muted rounded mb-2"></div>
                                <div className="h-4 bg-muted rounded w-20"></div>
                                </div>
                        ) : (
                            <>
                                <div className="text-2xl font-bold">${data.overview?.totalRevenue?.toFixed(2) || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    Last {timeRange} days
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="animate-pulse">
                                <div className="h-8 bg-muted rounded mb-2"></div>
                                <div className="h-4 bg-muted rounded w-24"></div>
                            </div>
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{data.overview?.totalTransactions || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    Total processed
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Failure Rate</CardTitle>
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="animate-pulse">
                                <div className="h-8 bg-muted rounded mb-2"></div>
                                <div className="h-4 bg-muted rounded w-20"></div>
                            </div>
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{(data.overview?.failureRate * 100)?.toFixed(1) || 0}%</div>
                                <p className="text-xs text-muted-foreground">
                                    Payment failures
                                </p>
                            </>
                        )}
                            </CardContent>
                        </Card>
                
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Credit Usage</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                        {loading ? (
                            <div className="animate-pulse">
                                <div className="h-8 bg-muted rounded mb-2"></div>
                                <div className="h-4 bg-muted rounded w-20"></div>
                                </div>
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{data.overview?.creditUsage || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    Credits consumed
                                </p>
                            </>
                        )}
                            </CardContent>
                        </Card>
                
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Gateways</CardTitle>
                        <Settings className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                        {loading ? (
                            <div className="animate-pulse">
                                <div className="h-8 bg-muted rounded mb-2"></div>
                                <div className="h-4 bg-muted rounded w-20"></div>
                                </div>
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{data.overview?.activeGateways || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    Payment gateways
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="credits">Credits</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="gateways">Gateways</TabsTrigger>
                    <TabsTrigger value="payouts">Payouts</TabsTrigger>
                    <TabsTrigger value="reports">Reports</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Revenue Chart Placeholder */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Revenue Trend</CardTitle>
                                <CardDescription>Revenue over the last {timeRange} days</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-64 flex items-center justify-center text-muted-foreground">
                                    <BarChart3 className="h-8 w-8 mr-2" />
                                    Chart visualization coming soon
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Status</CardTitle>
                                <CardDescription>Recent payment activity</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {data.paymentAnalytics?.paymentStats ? (
                                    <div className="space-y-4">
                                        {data.paymentAnalytics.paymentStats.map((stat) => (
                                            <div key={stat._id} className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <Badge variant={stat._id === 'completed' ? 'default' : 'secondary'}>
                                                        {stat._id}
                                                    </Badge>
                                                    <span className="text-sm">{stat.count} payments</span>
                                                </div>
                                                <span className="font-medium">
                                                    ${stat.totalAmount?.toFixed(2) || 0}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-muted-foreground py-8">
                                        No payment data available
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Credits Tab */}
                <TabsContent value="credits" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Credit System */}
                    <Card>
                        <CardHeader>
                                <CardTitle>Credit System</CardTitle>
                                <CardDescription>Configure credit types and pricing</CardDescription>
                        </CardHeader>
                            <CardContent>
                                {data.creditSystem ? (
                                    <div className="space-y-4">
                                        {Object.entries(data.creditSystem.creditTypes || {}).map(([key, credit]) => (
                                            <div key={key} className="flex items-center justify-between p-3 border rounded">
                                                <div>
                                                    <div className="font-medium">{credit.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        Base: ${credit.basePrice} | Markup: ${credit.markup}
                                                    </div>
                                                </div>
                                                <Badge variant="outline">Active</Badge>
                                    </div>
                                ))}
                            </div>
                                ) : (
                                    <div className="text-center text-muted-foreground py-8">
                                        Loading credit system...
                            </div>
                                )}
                        </CardContent>
                    </Card>

                        {/* Credit Packages */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Credit Packages</CardTitle>
                                <CardDescription>Available credit packages</CardDescription>
                        </CardHeader>
                        <CardContent>
                                {data.creditPackages && data.creditPackages.length > 0 ? (
                                    <div className="space-y-3">
                                        {data.creditPackages.map((pkg) => (
                                            <div key={pkg.id} className="flex items-center justify-between p-3 border rounded">
                                                <div>
                                                    <div className="font-medium">{pkg.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {pkg.aiCredits} AI Credits | {pkg.emailCredits} Email Credits
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold">${pkg.price}</div>
                                                    <Badge variant={pkg.autoRecharge ? 'default' : 'secondary'}>
                                                        {pkg.autoRecharge ? 'Auto' : 'Manual'}
                                                </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-muted-foreground py-8">
                                        No credit packages available
                                    </div>
                                )}
                        </CardContent>
                    </Card>
                    </div>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Revenue Analytics */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue Analytics</CardTitle>
                                <CardDescription>Detailed revenue breakdown</CardDescription>
                        </CardHeader>
                        <CardContent>
                                {data.revenueAnalytics ? (
                                    <div className="space-y-4">
                                        <div className="flex justify-between">
                                            <span>Total Revenue</span>
                                            <span className="font-bold">${data.revenueAnalytics.totalRevenue?.toFixed(2)}</span>
                                            </div>
                                        <div className="flex justify-between">
                                            <span>Transactions</span>
                                            <span className="font-bold">{data.revenueAnalytics.totalTransactions}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Average Order</span>
                                            <span className="font-bold">${data.revenueAnalytics.averageOrderValue?.toFixed(2)}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground py-8">
                                        Loading revenue analytics...
                                </div>
                            )}
                        </CardContent>
                    </Card>

                        {/* Payment Failures */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Failures</CardTitle>
                                <CardDescription>Failure analysis and trends</CardDescription>
                        </CardHeader>
                        <CardContent>
                                {data.paymentFailures ? (
                                    <div className="space-y-4">
                                        <div className="flex justify-between">
                                            <span>Failure Rate</span>
                                            <span className="font-bold text-red-600">
                                                {(data.paymentFailures.failureRate * 100)?.toFixed(1)}%
                                            </span>
                                            </div>
                                        <div className="flex justify-between">
                                            <span>Failed Transactions</span>
                                            <span className="font-bold">{data.paymentFailures.failedTransactions}</span>
                                        </div>
                                        <Progress value={data.paymentFailures.failureRate * 100} className="h-2" />
                                            </div>
                                ) : (
                                    <div className="text-center text-muted-foreground py-8">
                                        Loading failure data...
                                        </div>
                                )}
                            </CardContent>
                        </Card>
                                    </div>
                </TabsContent>

                {/* Gateways Tab */}
                <TabsContent value="gateways" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Gateways</CardTitle>
                            <CardDescription>Configure and manage payment gateways</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {data.paymentGateways && data.paymentGateways.length > 0 ? (
                                <div className="space-y-4">
                                    {data.paymentGateways.map((gateway) => (
                                        <div key={gateway.gatewayName} className="flex items-center justify-between p-4 border rounded">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                                    <CreditCard className="h-5 w-5 text-primary" />
                                                </div>
                                    <div>
                                                    <div className="font-medium capitalize">{gateway.gatewayName}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        Fee: {gateway.feeStructure?.percentage || 0}% + ${gateway.feeStructure?.fixed || 0}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Badge variant={gateway.isEnabled ? 'default' : 'secondary'}>
                                                    {gateway.isEnabled ? 'Enabled' : 'Disabled'}
                                                </Badge>
                                                <Button size="sm" variant="outline">
                                                    Configure
                                                </Button>
                                    </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground py-8">
                                    No payment gateways configured
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Payouts Tab */}
                <TabsContent value="payouts" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Commission Payouts</CardTitle>
                            <CardDescription>Manage commission payouts and processing</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {data.commissionPayouts ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600">
                                                {data.commissionPayouts.pendingCount || 0}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Pending</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {data.commissionPayouts.processedCount || 0}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Processed</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-red-600">
                                                {data.commissionPayouts.failedCount || 0}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Failed</div>
                                        </div>
                                    </div>
                                    
                                    {data.commissionPayouts.payouts && data.commissionPayouts.payouts.length > 0 && (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                                    <TableHead>User</TableHead>
                                                    <TableHead>Amount</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                                {data.commissionPayouts.payouts.slice(0, 5).map((payout) => (
                                                    <TableRow key={payout._id}>
                                                        <TableCell>{payout.userName || 'Unknown'}</TableCell>
                                                        <TableCell>${payout.amount?.toFixed(2)}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={
                                                                payout.status === 'completed' ? 'default' :
                                                                payout.status === 'pending' ? 'secondary' : 'destructive'
                                                            }>
                                                                {payout.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            {new Date(payout.createdAt).toLocaleDateString()}
                                                        </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground py-8">
                                    Loading commission payouts...
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Reports Tab */}
                <TabsContent value="reports" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Reports</CardTitle>
                            <CardDescription>Detailed payment analytics and reports</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {data.paymentAnalytics ? (
                                <div className="space-y-6">
                                    {/* Business Type Breakdown */}
                                    {data.paymentAnalytics.businessTypeStats && data.paymentAnalytics.businessTypeStats.length > 0 && (
                                    <div>
                                            <h4 className="font-semibold mb-3">Business Type Breakdown</h4>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                        <TableHead>Business Type</TableHead>
                                                        <TableHead>Count</TableHead>
                                                        <TableHead>Total Amount</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                    {data.paymentAnalytics.businessTypeStats.map((stat) => (
                                                        <TableRow key={stat._id}>
                                                            <TableCell className="capitalize">{stat._id}</TableCell>
                                                            <TableCell>{stat.count}</TableCell>
                                                            <TableCell>${stat.totalAmount?.toFixed(2)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                    )}

                                    {/* Payment Status Summary */}
                                    {data.paymentAnalytics.paymentStats && (
                                        <div>
                                            <h4 className="font-semibold mb-3">Payment Status Summary</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {data.paymentAnalytics.paymentStats.map((stat) => (
                                                    <div key={stat._id} className="text-center p-4 border rounded">
                                                        <div className="text-2xl font-bold">
                                                            ${stat.totalAmount?.toFixed(2) || 0}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground capitalize">
                                                            {stat._id} ({stat.count})
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground py-8">
                                    Loading payment reports...
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default FinancialDashboard;
