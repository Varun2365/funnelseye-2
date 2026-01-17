import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { 
    DollarSign, 
    CreditCard, 
    Download, 
    Upload, 
    Settings, 
    RefreshCw,
    AlertTriangle,
    CheckCircle,
    Clock,
    TrendingUp,
    Users,
    BarChart3,
    Zap,
    Shield,
    Banknote
} from 'lucide-react';
import adminApiService from '../services/adminApiService';

const PaymentManagement = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    
    // Razorpay Configuration
    const [razorpayConfig, setRazorpayConfig] = useState({
        keyId: '',
        keySecret: '',
        accountNumber: ''
    });
    const [razorpayStatus, setRazorpayStatus] = useState(null);
    
    // MLM Commission Settings
    const [mlmSettings, setMlmSettings] = useState({
        mlmLevels: [
            { level: 1, percentage: 10, isActive: true },
            { level: 2, percentage: 5, isActive: true },
            { level: 3, percentage: 3, isActive: true },
            { level: 4, percentage: 2, isActive: true },
            { level: 5, percentage: 1, isActive: true }
        ],
        minimumPayoutAmount: 500
    });
    
    // Payout Management
    const [payoutPeriod, setPayoutPeriod] = useState('2024-01');
    const [payoutResults, setPayoutResults] = useState(null);
    const [selectedCoach, setSelectedCoach] = useState(null);
    const [commissionSummary, setCommissionSummary] = useState(null);

    const fetchRazorpayConfig = async () => {
        try {
            const response = await adminApiService.getRazorpayConfig();
            setRazorpayStatus(response.data);
        } catch (err) {
            console.error('Failed to fetch Razorpay config:', err);
        }
    };

    const fetchMlmSettings = async () => {
        try {
            const response = await adminApiService.getPaymentSettings();
            setMlmSettings(response.data);
        } catch (err) {
            console.error('Failed to fetch MLM settings:', err);
        }
    };

    useEffect(() => {
        fetchRazorpayConfig();
        fetchMlmSettings();
    }, []);

    const handleRazorpayConfigUpdate = async () => {
        try {
            setLoading(true);
            await adminApiService.updateRazorpayConfig(razorpayConfig);
            setSuccess('Razorpay configuration updated successfully');
            await fetchRazorpayConfig();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleMlmSettingsUpdate = async () => {
        try {
            setLoading(true);
            await adminApiService.updatePaymentSettings(mlmSettings);
            setSuccess('MLM commission settings updated successfully');
            await fetchMlmSettings();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleTestRazorpay = async () => {
        try {
            setLoading(true);
            const response = await adminApiService.testRazorpay();
            setSuccess('Razorpay test successful: ' + response.message);
        } catch (err) {
            setError('Razorpay test failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleMonthlyPayouts = async (dryRun = true) => {
        try {
            setLoading(true);
            const response = await adminApiService.processMonthlyPayouts(payoutPeriod, dryRun);
            setPayoutResults(response.data);
            setSuccess(dryRun ? 'Payout simulation completed' : 'Monthly payouts processed');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleMlmCommissionPayouts = async (dryRun = true) => {
        try {
            setLoading(true);
            const response = await adminApiService.processMlmCommissionPayouts(payoutPeriod, dryRun);
            setPayoutResults(response.data);
            setSuccess(dryRun ? 'MLM commission payout simulation completed' : 'MLM commission payouts processed');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSinglePayout = async (payoutData) => {
        try {
            setLoading(true);
            const response = await adminApiService.processSinglePayout(payoutData);
            setSuccess('Single payout processed successfully');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCommissionSummary = async (coachId) => {
        try {
            setLoading(true);
            const response = await adminApiService.getMlmCommissionSummary(coachId, payoutPeriod);
            setCommissionSummary(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon: Icon, color = "blue", change }) => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className={`h-4 w-4 text-${color}-600`} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {change && (
                    <p className={`text-xs ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {change > 0 ? '+' : ''}{change}% from last month
                    </p>
                )}
            </CardContent>
        </Card>
    );

    const getStatusBadge = (status) => {
        const variants = {
            success: 'default',
            processing: 'secondary',
            failed: 'destructive',
            pending: 'outline'
        };

        const colors = {
            success: 'text-green-600',
            processing: 'text-blue-600',
            failed: 'text-red-600',
            pending: 'text-yellow-600'
        };

        return (
            <Badge variant={variants[status] || 'outline'} className={colors[status]}>
                {status}
            </Badge>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Payment Management</h1>
                    <p className="text-muted-foreground">Manage payments, payouts, and commission settings</p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => {
                        fetchRazorpayConfig();
                        fetchMlmSettings();
                    }}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Alerts */}
            {error && (
                <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        {error}
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="ml-2"
                            onClick={() => setError(null)}
                        >
                            Dismiss
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            {success && (
                <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                        {success}
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="ml-2"
                            onClick={() => setSuccess(null)}
                        >
                            Dismiss
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="razorpay">Razorpay Config</TabsTrigger>
                    <TabsTrigger value="mlm">MLM Commissions</TabsTrigger>
                    <TabsTrigger value="payouts">Payouts</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-4">
                        <StatCard
                            title="Total Revenue"
                            value="₹1,234,567"
                            icon={DollarSign}
                            color="green"
                            change={12.5}
                        />
                        <StatCard
                            title="Active Payouts"
                            value="23"
                            icon={CreditCard}
                            color="blue"
                            change={-2.1}
                        />
                        <StatCard
                            title="MLM Commissions"
                            value="₹45,678"
                            icon={TrendingUp}
                            color="purple"
                            change={8.3}
                        />
                        <StatCard
                            title="Success Rate"
                            value="98.5%"
                            icon={CheckCircle}
                            color="green"
                            change={1.2}
                        />
                    </div>

                    {/* Razorpay Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Razorpay Status</CardTitle>
                            <CardDescription>Current payment gateway status</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="flex items-center space-x-2">
                                    <Shield className="h-4 w-4" />
                                    <span>Gateway Status: </span>
                                    <Badge variant={razorpayStatus?.isActive ? 'default' : 'destructive'}>
                                        {razorpayStatus?.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Banknote className="h-4 w-4" />
                                    <span>Account: {razorpayStatus?.accountNumber || 'Not configured'}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Clock className="h-4 w-4" />
                                    <span>Last Test: {razorpayStatus?.lastTest || 'Never'}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Razorpay Configuration Tab */}
                <TabsContent value="razorpay" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Razorpay Configuration</CardTitle>
                            <CardDescription>Configure Razorpay payment gateway settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="keyId">Key ID</Label>
                                    <Input
                                        id="keyId"
                                        placeholder="rzp_test_..."
                                        value={razorpayConfig.keyId}
                                        onChange={(e) => setRazorpayConfig(prev => ({ ...prev, keyId: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="keySecret">Key Secret</Label>
                                    <Input
                                        id="keySecret"
                                        type="password"
                                        placeholder="Enter key secret"
                                        value={razorpayConfig.keySecret}
                                        onChange={(e) => setRazorpayConfig(prev => ({ ...prev, keySecret: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="accountNumber">Account Number (Optional)</Label>
                                <Input
                                    id="accountNumber"
                                    placeholder="Enter account number"
                                    value={razorpayConfig.accountNumber}
                                    onChange={(e) => setRazorpayConfig(prev => ({ ...prev, accountNumber: e.target.value }))}
                                />
                            </div>
                            <div className="flex space-x-2">
                                <Button onClick={handleRazorpayConfigUpdate} disabled={loading}>
                                    <Settings className="h-4 w-4 mr-2" />
                                    Update Configuration
                                </Button>
                                <Button variant="outline" onClick={handleTestRazorpay} disabled={loading}>
                                    <Zap className="h-4 w-4 mr-2" />
                                    Test Connection
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* MLM Commission Settings Tab */}
                <TabsContent value="mlm" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>MLM Commission Structure</CardTitle>
                            <CardDescription>Configure commission percentages for different levels</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                {mlmSettings.mlmLevels.map((level, index) => (
                                    <div key={level.level} className="space-y-2">
                                        <Label htmlFor={`level-${level.level}`}>Level {level.level}</Label>
                                        <div className="flex space-x-2">
                                            <Input
                                                id={`level-${level.level}`}
                                                type="number"
                                                step="0.01"
                                                value={level.percentage}
                                                onChange={(e) => {
                                                    const newLevels = [...mlmSettings.mlmLevels];
                                                    newLevels[index].percentage = parseFloat(e.target.value);
                                                    setMlmSettings(prev => ({ ...prev, mlmLevels: newLevels }));
                                                }}
                                                placeholder="0"
                                            />
                                            <span className="flex items-center text-sm text-muted-foreground">%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="minimumPayout">Minimum Payout Amount (₹)</Label>
                                <Input
                                    id="minimumPayout"
                                    type="number"
                                    value={mlmSettings.minimumPayoutAmount}
                                    onChange={(e) => setMlmSettings(prev => ({ 
                                        ...prev, 
                                        minimumPayoutAmount: parseFloat(e.target.value) 
                                    }))}
                                />
                            </div>
                            <Button onClick={handleMlmSettingsUpdate} disabled={loading}>
                                <Settings className="h-4 w-4 mr-2" />
                                Update MLM Settings
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Commission Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Commission Summary</CardTitle>
                            <CardDescription>View commission details for specific coaches</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex space-x-2">
                                <Input
                                    placeholder="Enter Coach ID"
                                    value={selectedCoach || ''}
                                    onChange={(e) => setSelectedCoach(e.target.value)}
                                />
                                <Input
                                    placeholder="Period (YYYY-MM)"
                                    value={payoutPeriod}
                                    onChange={(e) => setPayoutPeriod(e.target.value)}
                                />
                                <Button 
                                    onClick={() => selectedCoach && handleCommissionSummary(selectedCoach)}
                                    disabled={!selectedCoach || loading}
                                >
                                    <BarChart3 className="h-4 w-4 mr-2" />
                                    Get Summary
                                </Button>
                            </div>
                            
                            {commissionSummary && (
                                <div className="space-y-2">
                                    <h4 className="font-medium">Commission Summary for {commissionSummary.coachName}</h4>
                                    <div className="grid gap-2 md:grid-cols-3">
                                        <div className="text-sm">
                                            <span className="text-muted-foreground">Total Commissions: </span>
                                            <span className="font-medium">₹{commissionSummary.commissions.totalCommissions}</span>
                                        </div>
                                        <div className="text-sm">
                                            <span className="text-muted-foreground">Commission Count: </span>
                                            <span className="font-medium">{commissionSummary.commissions.commissionCount}</span>
                                        </div>
                                        <div className="text-sm">
                                            <span className="text-muted-foreground">Period: </span>
                                            <span className="font-medium">{commissionSummary.period}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Payouts Tab */}
                <TabsContent value="payouts" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Payout Management</CardTitle>
                            <CardDescription>Process monthly payouts and MLM commissions</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="payoutPeriod">Payout Period</Label>
                                <Input
                                    id="payoutPeriod"
                                    placeholder="YYYY-MM"
                                    value={payoutPeriod}
                                    onChange={(e) => setPayoutPeriod(e.target.value)}
                                />
                            </div>
                            
                            <div className="grid gap-4 md:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Monthly Payouts</CardTitle>
                                        <CardDescription>Process regular monthly payouts</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <Button 
                                            variant="outline" 
                                            onClick={() => handleMonthlyPayouts(true)}
                                            disabled={loading}
                                            className="w-full"
                                        >
                                            <BarChart3 className="h-4 w-4 mr-2" />
                                            Simulate Payouts
                                        </Button>
                                        <Button 
                                            onClick={() => handleMonthlyPayouts(false)}
                                            disabled={loading}
                                            className="w-full"
                                        >
                                            <DollarSign className="h-4 w-4 mr-2" />
                                            Process Payouts
                                        </Button>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>MLM Commission Payouts</CardTitle>
                                        <CardDescription>Process MLM commission payouts</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <Button 
                                            variant="outline" 
                                            onClick={() => handleMlmCommissionPayouts(true)}
                                            disabled={loading}
                                            className="w-full"
                                        >
                                            <BarChart3 className="h-4 w-4 mr-2" />
                                            Simulate MLM Payouts
                                        </Button>
                                        <Button 
                                            onClick={() => handleMlmCommissionPayouts(false)}
                                            disabled={loading}
                                            className="w-full"
                                        >
                                            <TrendingUp className="h-4 w-4 mr-2" />
                                            Process MLM Payouts
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Payout Results */}
                            {payoutResults && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Payout Results</CardTitle>
                                        <CardDescription>Results from the latest payout process</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid gap-4 md:grid-cols-4">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold">{payoutResults.summary.totalCoaches}</div>
                                                <div className="text-sm text-muted-foreground">Total Coaches</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold">{payoutResults.summary.processedPayouts}</div>
                                                <div className="text-sm text-muted-foreground">Processed</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold">₹{payoutResults.summary.totalAmount}</div>
                                                <div className="text-sm text-muted-foreground">Total Amount</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-red-600">{payoutResults.summary.failedPayouts}</div>
                                                <div className="text-sm text-muted-foreground">Failed</div>
                                            </div>
                                        </div>
                                        
                                        {payoutResults.results && payoutResults.results.length > 0 && (
                                            <div className="mt-4">
                                                <h4 className="font-medium mb-2">Payout Details</h4>
                                                <div className="max-h-64 overflow-y-auto">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Coach</TableHead>
                                                                <TableHead>Amount</TableHead>
                                                                <TableHead>Status</TableHead>
                                                                <TableHead>Count</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {payoutResults.results.slice(0, 10).map((result, index) => (
                                                                <TableRow key={index}>
                                                                    <TableCell>{result.coachName}</TableCell>
                                                                    <TableCell>₹{result.commissionAmount || result.amount || 0}</TableCell>
                                                                    <TableCell>
                                                                        {getStatusBadge(
                                                                            result.payoutResult?.success ? 'success' : 
                                                                            result.wouldPayout ? 'pending' : 
                                                                            result.error ? 'failed' : 'pending'
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell>{result.commissionCount || 1}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <StatCard
                            title="Payment Success Rate"
                            value="98.5%"
                            icon={CheckCircle}
                            color="green"
                            change={1.2}
                        />
                        <StatCard
                            title="Average Transaction"
                            value="₹2,456"
                            icon={DollarSign}
                            color="blue"
                            change={-0.5}
                        />
                        <StatCard
                            title="Monthly Volume"
                            value="₹12.3M"
                            icon={TrendingUp}
                            color="purple"
                            change={15.3}
                        />
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Analytics</CardTitle>
                            <CardDescription>Detailed payment and payout analytics</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-muted-foreground">
                                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                                <p>Payment analytics charts will be displayed here</p>
                                <p className="text-sm">Integration with charting library needed</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default PaymentManagement;